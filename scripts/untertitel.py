#!/usr/bin/env python3
"""
Untertitel — transcreve video ou audio e gera legenda .srt em alemao.

Uso:
    python3 scripts/untertitel.py reel.mp4
    python3 scripts/untertitel.py reel.mp4 --modell medium --sprache de
    python3 scripts/untertitel.py interview.m4a --max-zeichen 32

Saida: reel.srt, ao lado do arquivo original, pronto para importar no CapCut.

Instalacao (uma vez, na tua maquina):
    pip install faster-whisper

Modelos, do mais rapido ao mais preciso:
    tiny · base · small (padrao) · medium · large-v3
O primeiro uso baixa o modelo automaticamente.
"""
import argparse
import sys
from pathlib import Path


def zeit(segundos: float) -> str:
    """Converte segundos para o formato de tempo do SRT."""
    ms = int(round(segundos * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def quebrar(texto: str, limite: int) -> str:
    """Quebra a linha para caber na tela vertical sem cortar palavra."""
    palavras = texto.split()
    linhas, atual = [], ""
    for p in palavras:
        if atual and len(atual) + 1 + len(p) > limite:
            linhas.append(atual)
            atual = p
        else:
            atual = f"{atual} {p}".strip()
    if atual:
        linhas.append(atual)
    return "\n".join(linhas)


def main() -> int:
    ap = argparse.ArgumentParser(description="Gera legenda .srt em alemao a partir de video ou audio")
    ap.add_argument("arquivo", help="video ou audio (mp4, mov, mp3, m4a, wav)")
    ap.add_argument("--modell", default="small", help="tiny, base, small, medium, large-v3")
    ap.add_argument("--sprache", default="de", help="codigo do idioma, de por padrao")
    ap.add_argument("--max-zeichen", type=int, default=38, help="caracteres por linha, 38 para 9:16")
    ap.add_argument("--saida", help="caminho do .srt, padrao ao lado do original")
    args = ap.parse_args()

    entrada = Path(args.arquivo)
    if not entrada.exists():
        print(f"Arquivo nao encontrado: {entrada}", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper nao instalado. Rode: pip install faster-whisper", file=sys.stderr)
        return 1

    print(f"Modelo {args.modell}, idioma {args.sprache}. O primeiro uso baixa o modelo.", file=sys.stderr)
    modelo = WhisperModel(args.modell, device="auto", compute_type="int8")

    segmentos, info = modelo.transcribe(
        str(entrada),
        language=args.sprache,
        vad_filter=True,
        beam_size=5,
    )

    destino = Path(args.saida) if args.saida else entrada.with_suffix(".srt")
    n = 0
    with destino.open("w", encoding="utf-8") as f:
        for seg in segmentos:
            texto = seg.text.strip()
            if not texto:
                continue
            n += 1
            f.write(f"{n}\n{zeit(seg.start)} --> {zeit(seg.end)}\n{quebrar(texto, args.max_zeichen)}\n\n")
            print(f"[{zeit(seg.start)}] {texto}", file=sys.stderr)

    if n == 0:
        print("Nenhuma fala reconhecida. Confira se o arquivo tem audio.", file=sys.stderr)
        return 2

    print(f"\n{n} blocos. Legenda salva em: {destino}", file=sys.stderr)
    print(f"Duracao {info.duration:.1f}s, idioma detectado {info.language}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
