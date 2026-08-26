<?php
/**
 * Template Name: FITARY Homepage
 * Description: Página standalone da homepage FITARY (HTML completo e auto-contido).
 *
 * Instalação:
 *   1. Copie este arquivo E o fitary-homepage.html para a pasta do tema ativo
 *      (wp-content/themes/SEU-TEMA/).
 *   2. No WordPress: Páginas → Adicionar nova → dê o título "FITARY" →
 *      em "Modelo" (Template) selecione "FITARY Homepage" → Publicar.
 */

$fitary_html = __DIR__ . '/fitary-homepage.html';

if ( is_readable( $fitary_html ) ) {
	readfile( $fitary_html );
} else {
	status_header( 500 );
	echo 'fitary-homepage.html não encontrado na pasta do tema.';
}
exit;
