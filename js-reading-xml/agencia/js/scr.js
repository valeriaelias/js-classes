function load(file){
	if (window.XMLHttpRequest){ //verificação do browser
		xhttp = new XMLHttpRequest(); //browsers novos
	} else {
		xhttp = new ActiveXObject("Microsoft.XMLHTTP"); //browsers antigos
	}
	xhttp.open("GET",file,false); //abre o arquivo que foi enviado por parâmetro na função list "file" -> aa.xml
	xhttp.send(); //comando xml para abrir o arquivo
	xmlDoc = xhttp.responseXML; //guarda na variável todo o texto do xml

	return xmlDoc; // retorna o valor do xml
}


// LOGIN DO CANDIDATO
function logarCand(){
	var xml = load("xml/candidato.xml");
	//alert((new XMLSerializer()).serializeToString(xml));

	var obj = xml.getElementsByTagName("login"); // pega todas as tags login de todos os candidatos no xml
	var clogin = $("#login").val(); // pega o valor digitado no campo login
	var csenha = $("#senha").val(); // pega o valor digitado no campo login

	for(var i=0;i<obj.length;i++){ // percorre as tags login de todos os candidatos, uma por uma
		//alert(obj[i].innerHTML);

		if (obj[i].innerHTML == clogin) { // se o login do candadito que esta sendo verificado for = o valor digitado no campo login entao...			
			var cpass = obj[i].nextSibling; // .. procura a proxima tag "irmã" da tag login
			while (cpass.nodeName != "senha") { // enquanto a tag "irmã" não for a tag senha, passa para a proxima tag. qdo a tag encontrada for a senha..
				cpass = cpass.nextSibling;
			}
			cpass = cpass.childNodes[0].nodeValue; // .. pega o valor da tag senha

			if (cpass == csenha) { // e compara com o valor digitado no campo senha, se for igual.. 
				document.forms.formi.i.value = i // coloca no formulario de login a posicao (i) do candidato no xml para que o html envie essa informaçao para a proxima pagina que irá mostrar oos dados desse candidato na tela
				return true; // deixa o user entrar
			} else { // senao
				alert("Senha não confere!"); 
				return false; // anula o login
			}
		}
	}
	alert("O login digitado não existe");
	return false; // se o login digitado no campo login tambem nao for encontrado no xml, tambem anula o login	
}


// CADASTRO DO CANDIDATO
function cadCand(){
	var start = performance.now(); // inicia contagem tempo de execucao

	// validacao de campos
	var sexoSel = document.forms.candidato.sexo.value;
	var vNome = $("#nome").val();
	var vIdade = $("#idade").val();
	var vLogin = $("#login").val();
	var vSenha = $("#senha").val();
	var vReSenha = $("#resenha").val();
	if (vNome == "") {alert("Nome deve ser preenchido"); document.getElementById("nome").focus(); return false;}
	if (sexoSel == "") {alert("Selecione o Sexo"); return false;}
	if (vIdade == "") {alert("Idade deve ser preenchida"); document.getElementById("idade").focus(); return false;}
	if (! $.isNumeric(vIdade)) {
		alert("Idade deve ser um número"); document.getElementById("idade").focus(); 
		return false;
	} else {
		if (vIdade < 18) {alert("O Candidato deve ter mais de 18 anos"); document.getElementById("idade").focus(); return false;}
	}
	if (vLogin == "") {alert("Login deve ser preenchido"); document.getElementById("login").focus(); return false;}
	if (vSenha == "") {alert("Senha deve ser preenchida"); document.getElementById("senha").focus(); return false;}
	if (vSenha != vReSenha) {alert("Senha e Re-Senha devem ser iguais"); document.getElementById("resenha").focus(); return false;}


	var xmlDoc = load("xml/candidato.xml");
	var a = xmlDoc.getElementsByTagName("candidatos")[0];

	//pega o cod do ultimo candidato cadastrado e faz o incremento para salvar o cod do proximo candidato
	var x=a.lastChild; // variavel pega o ultimo candidato 
		// para nao pegar os valores em branco
		while (x.nodeType!=1) { // alguns navegadores consideram espacos em branco no xml e isso faz dar erro se por acaso tiver algum espaço no final do xml entao, esse while repete o procedimento que está dentro dele enquanto houver espaço vazio (nodeType = 1, true, nao esta vazio -- nodeType != 1, repete o procedimento só enquanto está vazio, enquanto nao é true) 
			x=x.previousSibling; // vai para o nó anterior. Ou seja, até encontrar realmente o ultimo cadastro de candidato
		}
		x = x.firstChild; // depois que achou o registro do ultimo candidato vamos procurar o valor do cod dele. como o codigo é o primeiro atributo, vamos para firstChild
		while (x.nodeType!=1) { // o firstChild encontrado tambem pode ser um espaco em branco entao repetimos a mesma logica que usamos para encontrar o ultimo candidato
			x=x.nextSibling; // vai para o prox nó até achar o codcand
		}
		var y = parseInt(x.childNodes[0].nodeValue); // achado o atributo codcand, pegamos o valor dele e convertemos em inteiro
		y = y + 1; // somamos 1 ao numero do codigo assim, se o ultimo candidato tinha codigo 4, o que vamos cadastrar agora terá codigo 5
	

	// monta o xml colocando os valores que vem do formulario de cadastro dentro dos atributos correspondentes.
	// fazemos esses atributos entrarem na estrutura xml como nós (filhos) de candidato e depois inserimos esse candidato no final 
	var cand = xmlDoc.createElement("candidato");
	var codc = xmlDoc.createElement("codcand");
	var n = xmlDoc.createElement("nome");
	var i = xmlDoc.createElement("idade");
	var s = xmlDoc.createElement("sexo");
	var p = xmlDoc.createElement("pretensao");
	var lo = xmlDoc.createElement("login");
	var se = xmlDoc.createElement("senha");

	var codcand = xmlDoc.createTextNode(y);
	var nome = xmlDoc.createTextNode($("#nome").val());
	var sexo = xmlDoc.createTextNode(sexoSel);
	var idade = xmlDoc.createTextNode($("#idade").val());
	var pretensao = xmlDoc.createTextNode($("#pretensao").val());
	var login = xmlDoc.createTextNode($("#login").val());
	var senha = xmlDoc.createTextNode($("#senha").val());

	cand.appendChild(codc);
	codc.appendChild(codcand);

	cand.appendChild(n);
	n.appendChild(nome);
	
	cand.appendChild(i);
	i.appendChild(idade);

	cand.appendChild(s);
	s.appendChild(sexo);

	cand.appendChild(p);
	p.appendChild(pretensao);

	cand.appendChild(lo);
	lo.appendChild(login);

	cand.appendChild(se);
	se.appendChild(senha);

	a.appendChild(cand);

	//alert((new XMLSerializer()).serializeToString(xmlDoc));

	$.ajax({
		type: "POST",
		url: "save.php",
		data: xmlDoc,
		async: false,
		processData: false,
		contentType: "text/xml",
		success: function(data){
			//alert(data);
		},		
		//complete: function(xhr, statusText){
	    	//alert(xhr.status); 
	    //},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
	        alert("XMLHttpRequest="+XMLHttpRequest.responseText+"\ntextStatus="+textStatus+"\nerrorThrown="+errorThrown);
	    }
	});
		
    document.getElementById("resultado").innerHTML = "<h2>Candidato Cadastrado com Sucesso</h2><br><a href='agencia_est.html'>Voltar</a><br>";

	var end = performance.now(); // termina contagem do tempo de execução
    var time = parseFloat(end - start)/1000;
    document.getElementById("mostraTime").innerHTML = "<h3>Tempo de Execução:</h3>" + time + " seg";
}


// LE DADOS DO CANDIDATO NA PAGINA LOGADA
function mostrarCand(){
	var x = window.location.search.substring(1);
	var res = parseInt(x.substr(2));

	var xmlDoc = load("xml/candidato.xml");
	var obj = xmlDoc.getElementsByTagName("candidato")[res];

	function monta() {
		var sexo = obj.childNodes[3].childNodes[0].nodeValue;
		switch(sexo) {
			case "f":
				s = "Feminino";
				break;
			case "m":
				s = "Masculino";
				break;
			default:
				s = "Indefinido"
		}
		return "<strong>" + obj.childNodes[1].childNodes[0].nodeValue + "</strong><br>Idade: " + obj.childNodes[2].childNodes[0].nodeValue + "<br>Sexo: " + s;
	}
	$("#quadroDados").html(monta());
}


function buscaVaga(){
	var prof = $("#profissao").val();
	
	var xmlDoc = load("xml/vagas.xml");
	var obj = xmlDoc.getElementsByTagName("codprofissao");
	

	function montaVaga() {
		var tabela = "<table><tr><th>Descrição</th><th>Salário</th><th>Local</th><th></th></tr>";

		for(var i=0;i<obj.length;i++){ 
			if (obj[i].innerHTML == prof) { 		
				var v_campo = obj[i].previousSibling; 
				while (v_campo.nodeName != "salariovaga") { 
					v_campo = v_campo.previousSibling;
				}
				v_salario = v_campo.childNodes[0].nodeValue; 

				while (v_campo.nodeName != "localvaga") { 
					v_campo = v_campo.previousSibling;
				}
				v_local = v_campo.childNodes[0].nodeValue; 

				while (v_campo.nodeName != "descrvaga") { 
					v_campo = v_campo.previousSibling;
				}
				v_descr = v_campo.childNodes[0].nodeValue; 

				tabela = tabela + "<tr><td>" + v_descr + "</td><td>" + v_salario + "</td><td>" + v_local + "</td><td><button class='btTable'>Inscrever</button></td></tr>";
			}
		}

		tabela = tabela + "</table>";

		return tabela;
	}

	$("#mostraVagas").html(montaVaga());
}