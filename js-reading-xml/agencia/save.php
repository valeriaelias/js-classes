<?

$dado = $HTTP_RAW_POST_DATA; // do metodo post estou pegando um objeto - no caso, o objeto xml

if ($dado!=null){
	$f = 'xml/candidato.xml';
	$handle = fopen($f,'w');
	fwrite($handle,$dado);
	fclose($handle);
	echo "Candidato Cadastrado";
} else {
	echo "Erro";
}

?>