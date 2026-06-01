// Aqui fica os códigos de JS, que guardam as funçoes, leitura de dados, logica e etc

// 1. Aqui recupera / inicializa os pontos pegos do sessionStorage
let pontos = JSON.parse(sessionStorage.getItem("quiz_pontos")) || {
    remy: 0,
    buzz: 0,
    mcqueen: 0,
    dory: 0,
    nojinho: 0
};

// 2. Identifica qual /questão o usuário tá com base no atributo do body
const bodyElement = document.body;
const questaoAtualIndex = parseInt(bodyElement.getAttribute("data-questao"));

// Busca os dados dos elementos no HTML usando querySelector
const identificador = document.querySelector("#identificador");
const questionElement = document.querySelector(".question");
const answerButtons = document.querySelector("#answear-buttons");
const nextButton = document.querySelector("#nextBtn");
const posterFilmeElemento = document.querySelector('#personagem-filme-poster');

// Variáveis temporárias p armazenar a resposta selecionada antes de clicar em "Próxima"
let personagemSelecionadoTemporariamente = null;
let respostaTextoTemporaria = "";

// 3. Função p carregar a pergunta na tela
function carregarQuestaoNaTela() {
    if (nextButton) {
        nextButton.style.display = "block"; 
        nextButton.disabled = true;        
    }

    // Se o body indicar que é a página de resultado, ent se carrega os dados do resultado
    if (bodyElement && bodyElement.getAttribute("data-questao") === "resultado") {
        mostrarResultado();
        return;
    }

    // Mas caso não for número da pag (página desconhecida), ele não faz nada
    if (isNaN(questaoAtualIndex)) return;

    //aq carrega a pergunta, exibe as alternativas e registra qual opção o usuário escolheu para liberar o botão de avançar.
    const dadosQuestao = quiz[questaoAtualIndex];
    
    if (!dadosQuestao) {
        console.error("Erro: Pergunta não encontrada para o índice " + questaoAtualIndex);
        return;
    }
    if (identificador) identificador.innerHTML = `Questão ${questaoAtualIndex + 1}`;
    if (questionElement) questionElement.innerHTML = dadosQuestao.pergunta;
    
    if (answerButtons) {
        answerButtons.innerHTML = ""; 

        dadosQuestao.opcoes.forEach(opcao => {
            const button = document.createElement("button");
            button.innerHTML = opcao.texto;
            button.classList.add("btn");

            button.addEventListener("click", () => {
                Array.from(answerButtons.children).forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");
                
                personagemSelecionadoTemporariamente = opcao.personagem;
                respostaTextoTemporaria = opcao.texto;
                
                if (nextButton) nextButton.disabled = false;
            });

            answerButtons.appendChild(button);
        });
    }
}

// 4. Aqui salva a resposta escolhida do usuário, atualiza a pontuação do personagem, salva os dados do quiz e mandam p próxima página.
if (nextButton) {
    nextButton.addEventListener("click", () => {
        if (personagemSelecionadoTemporariamente) {
            
            // Salva a pontuação no sessionStorage
            pontos[personagemSelecionadoTemporariamente]++;
            sessionStorage.setItem("quiz_pontos", JSON.stringify(pontos));

            // Salva o histórico da resposta
            let respostasSalvas = JSON.parse(sessionStorage.getItem("quiz_respostas_usuario")) || [];
            respostasSalvas[questaoAtualIndex] = {
                pergunta: quiz[questaoAtualIndex].pergunta,
                resposta: respostaTextoTemporaria
            };
            sessionStorage.setItem("quiz_respostas_usuario", JSON.stringify(respostasSalvas));

            let proximoIndex = questaoAtualIndex + 1;
            
            if (proximoIndex < quiz.length) {
                window.location.href = `questao0${proximoIndex + 1}.html`;
            } else {
                window.location.href = "../resultado.html";
            }
        }
    });
}

// 5. Aqui a função acessa a pontuação do quiz, 
// identifica qual o personagem 'venceu', calcula a porcentagem, 
// e exibe todas as info do personagem na página de resultado e coisa o botão de reiniciar o quiz.
function mostrarResultado() {
    let vencedor = "nojinho"; 
    let maiorPontuacao = -1;

    // acessa os pontos e ve o vencedor
    for (let personagem in pontos) {
        if (pontos[personagem] > maiorPontuacao) {
            maiorPontuacao = pontos[personagem];
            vencedor = personagem;
        }
    }

    // Aqui foi feito o calculo da porcentagem
    let totalPerguntas = 5;
    let pontosVencedor = pontos[vencedor];
    
    if (pontosVencedor > totalPerguntas) {
        pontosVencedor = totalPerguntas;
    }
    
    // Multiplica os pontos por 100 e divide pelo total de perguntas
    let porcentagemVencedor = Math.round((pontosVencedor / totalPerguntas) * 100);

    // Acessa a primeira posição do array resultados do seu bdResultados.js
    const dadosPersonagens = resultados[0];
    const dadosDoVencedor = dadosPersonagens[vencedor];

    if (dadosDoVencedor) {
        const topoNome = document.querySelector("#topo-nome-personagem");
        const personagemNome = document.querySelector("#personagem-nome");
        const personagemImagem = document.querySelector("#personagem-imagem");
        const personagemDescricao = document.querySelector("#personagem-descricao");
        const personagemCuriosidade = document.querySelector("#personagem-curiosidade");
        const personagemFrase = document.querySelector("#personagem-frase");
        const personagemAutor = document.querySelector("#personagem-autor");
        const tituloCuriosidade = document.querySelector("#titulo-curiosidade");
        const personagemPontos = document.querySelector("#personagem-pontos");

        // Altera os conteúdos com base no banco de dados de resultados
        if (topoNome) topoNome.innerText = dadosDoVencedor.nome.toUpperCase();
        if (personagemNome) personagemNome.innerText = dadosDoVencedor.nome.toUpperCase();
        
        if (personagemPontos) {
            personagemPontos.innerText = `${porcentagemVencedor}% Compatível`;
        }

        if (personagemImagem) {
            let caminhoImagem = dadosDoVencedor.Imagem;
            if (caminhoImagem.startsWith("/")) {
                caminhoImagem = caminhoImagem.substring(1);
            }
            personagemImagem.src = caminhoImagem;
            personagemImagem.alt = dadosDoVencedor.nome;
        }
        
        // Altera o pôster do filme
        if (posterFilmeElemento && dadosDoVencedor.filmePoster) {
            posterFilmeElemento.src = dadosDoVencedor.filmePoster;
            posterFilmeElemento.alt = `Pôster do filme do personagem ${dadosDoVencedor.nome}`;
        }
        
        if (personagemDescricao) personagemDescricao.innerText = dadosDoVencedor.descricao;
        if (tituloCuriosidade) tituloCuriosidade.innerText = `Curiosidades da ${dadosDoVencedor.nome.toUpperCase()}`;

        if (personagemCuriosidade) {
            personagemCuriosidade.innerText = dadosDoVencedor.curiosidade;
        }
        if (personagemFrase) {
            personagemFrase.innerText = `"${dadosDoVencedor.frase}"`;
        }
        if (personagemAutor) {
            personagemAutor.innerText = dadosDoVencedor.autor;
        }
    }

    // Configuração para o botão recomeçar limpar a memória
    const btnRefazer = document.querySelector("#btn-refazer");
    if (btnRefazer) {
        btnRefazer.addEventListener("click", () => {
            sessionStorage.removeItem("quiz_pontos");
            sessionStorage.removeItem("quiz_respostas_usuario");
            window.location.href = "Questoes/questao01.html"; 
        });
    }
}

// Executa ao carregar a página
carregarQuestaoNaTela();