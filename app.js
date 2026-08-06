// =====================================================
// SMI WMS - APP.JS
// NOVA VERSÃO ORGANIZADA
// PARTE 1 - FUNÇÕES GERAIS
// =====================================================


// =====================================================
// INICIALIZAÇÃO GERAL
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarRelogio();
        carregarNomeUsuario();

    }
);


// =====================================================
// RELÓGIO
// =====================================================

function atualizarRelogio() {

    const relogio =
        document.getElementById(
            "relogio"
        );

    if (!relogio) {
        return;
    }

    relogio.textContent =
        new Date().toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


setInterval(
    atualizarRelogio,
    1000
);


// =====================================================
// USUÁRIO DO SISTEMA
// =====================================================

function carregarNomeUsuario() {

    const elemento =
        document.getElementById(
            "nomeUsuario"
        );

    if (!elemento) {
        return;
    }

    const nome =
        obterNomeUsuario();

    elemento.textContent =
        "👤 " + nome;

}


function obterNomeUsuario() {

    const chaves = [
        "nomeUsuario",
        "usuarioLogado",
        "usuario",
        "operador"
    ];


    for (const chave of chaves) {

        const valor =
            localStorage.getItem(chave);

        if (
            !valor ||
            valor.trim() === ""
        ) {
            continue;
        }


        try {

            const dados =
                JSON.parse(valor);

            if (
                dados &&
                typeof dados === "object"
            ) {

                return (
                    dados.nome ||
                    dados.usuario ||
                    dados.login ||
                    "Administrador"
                );

            }

        } catch (erro) {

            return valor;

        }

    }


    return "Administrador";

}


// =====================================================
// LOGIN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botaoLogin =
            document.getElementById(
                "btnLogin"
            );

        if (!botaoLogin) {
            return;
        }


        botaoLogin.addEventListener(
            "click",
            realizarLogin
        );


        const campoSenha =
            document.getElementById(
                "senha"
            );

        if (campoSenha) {

            campoSenha.addEventListener(
                "keydown",
                function (evento) {

                    if (
                        evento.key ===
                        "Enter"
                    ) {

                        realizarLogin();

                    }

                }
            );

        }

    }
);


function realizarLogin() {

    const campoUsuario =
        document.getElementById(
            "usuario"
        );

    const campoSenha =
        document.getElementById(
            "senha"
        );


    if (
        !campoUsuario ||
        !campoSenha
    ) {

        alert(
            "Os campos de login não foram encontrados."
        );

        return;

    }


    const usuario =
        String(
            campoUsuario.value || ""
        )
        .trim()
        .toLowerCase();


    const senha =
        String(
            campoSenha.value || ""
        )
        .trim();


const usuariosPermitidos = [

    {
        login: "administrador",
        senha: "1234",
        nome: "Administrador"
    },

    {
        login: "julio.smi",
        senha: "1234",
        nome: "JULIO.SMI"
    },

    {
        login: "rafael.smi",
        senha: "1234",
        nome: "RAFAEL.SMI"
    },

    {
        login: "marcos.smi",
        senha: "1234",
        nome: "MARCOS.SMI"
    }

];

const usuarioEncontrado =
    usuariosPermitidos.find(
        function (item) {

            return (
                item.login === usuario &&
                item.senha === senha
            );

        }
    );

if (usuarioEncontrado) {

    localStorage.setItem(
        "usuario",
        usuarioEncontrado.nome
    );

    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(
            usuarioEncontrado
        )
    );

    window.location.href =
        "dashboard.html";

    return;

}


    alert(
        "Usuário ou senha inválidos."
    );


    campoSenha.value = "";

    campoSenha.focus();

}


// =====================================================
// SAIR DO SISTEMA
// =====================================================

function sairSistema() {

    const confirmou =
        confirm(
            "Deseja realmente sair do sistema?"
        );


    if (!confirmou) {
        return;
    }


    localStorage.removeItem(
        "usuarioLogado"
    );


    window.location.href =
        "index.html";

}


// =====================================================
// BANCO LOCAL — ESTOQUE
// =====================================================

function carregarEstoque() {

    try {

        const dados =
            JSON.parse(
                localStorage.getItem(
                    "estoque"
                )
            );


        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar estoque:",
            erro
        );


        return [];

    }

}


function salvarEstoque(estoque) {

    if (!Array.isArray(estoque)) {

        console.error(
            "O estoque informado não é uma lista válida."
        );

        return false;

    }


    try {

        localStorage.setItem(
            "estoque",
            JSON.stringify(
                estoque
            )
        );


        return true;

    } catch (erro) {

        console.error(
            "Erro ao salvar estoque:",
            erro
        );


        alert(
            "Não foi possível salvar o estoque."
        );


        return false;

    }

}


// =====================================================
// LEITURA SEGURA DO LOCALSTORAGE
// =====================================================

function carregarListaLocalStorage(
    chave
) {

    try {

        const dados =
            JSON.parse(
                localStorage.getItem(
                    chave
                )
            );


        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar " +
            chave +
            ":",
            erro
        );


        return [];

    }

}


function salvarListaLocalStorage(
    chave,
    lista
) {

    if (!Array.isArray(lista)) {

        console.error(
            "Os dados da chave " +
            chave +
            " não são uma lista."
        );

        return false;

    }


    try {

        localStorage.setItem(
            chave,
            JSON.stringify(lista)
        );


        return true;

    } catch (erro) {

        console.error(
            "Erro ao salvar " +
            chave +
            ":",
            erro
        );


        return false;

    }

}


// =====================================================
// NORMALIZAÇÃO DE CÓDIGOS E ENDEREÇOS
// =====================================================

function normalizarCodigo(
    codigo
) {

    return String(
        codigo || ""
    )
    .trim()
    .toUpperCase();

}


function normalizarEndereco(
    endereco
) {

    return String(
        endereco || ""
    )
    .trim()
    .toUpperCase()
    .replace(
        /\s+/g,
        ""
    );

}


// =====================================================
// CONVERSÃO DE NÚMEROS
// =====================================================

function converterNumero(
    valor
) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {

        return 0;

    }


    if (
        typeof valor ===
        "number"
    ) {

        return Number.isFinite(valor)
            ? valor
            : 0;

    }


    let texto =
        String(valor)
            .trim()
            .replace(
                /\s/g,
                ""
            );


    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

    } else if (
        texto.includes(",")
    ) {

        texto =
            texto.replace(
                ",",
                "."
            );

    }


    texto =
        texto.replace(
            /[^0-9.-]/g,
            ""
        );


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : 0;

}


// =====================================================
// FORMATAÇÃO DE QUANTIDADE
// =====================================================

function formatarQuantidade(
    valor
) {

    return converterNumero(
        valor
    ).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }
    );

}


// =====================================================
// DATA E HORA
// =====================================================

function obterDataHoraAtual() {

    return new Date()
        .toLocaleString(
            "pt-BR"
        );

}


// =====================================================
// CRIAR CÉLULA DE TABELA
// =====================================================

function criarCelula(
    valor
) {

    const celula =
        document.createElement(
            "td"
        );


    celula.textContent =

        valor === undefined ||
        valor === null ||
        valor === ""

            ? "-"

            : valor;


    return celula;

}


// =====================================================
// LIMPEZA ADMINISTRATIVA DO ESTOQUE
// =====================================================

function limparEstoque() {

    const confirmou =
        confirm(
            "Deseja apagar todo o estoque?\n\n" +
            "Esta ação não poderá ser desfeita."
        );


    if (!confirmou) {
        return;
    }


    localStorage.removeItem(
        "estoque"
    );


    alert(
        "Estoque apagado com sucesso."
    );


    window.location.reload();

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.atualizarRelogio =
    atualizarRelogio;

window.carregarEstoque =
    carregarEstoque;

window.salvarEstoque =
    salvarEstoque;

window.sairSistema =
    sairSistema;

window.normalizarCodigo =
    normalizarCodigo;

window.normalizarEndereco =
    normalizarEndereco;

window.converterNumero =
    converterNumero;

window.formatarQuantidade =
    formatarQuantidade;

window.obterDataHoraAtual =
    obterDataHoraAtual;

window.criarCelula =
    criarCelula;

window.limparEstoque =
    limparEstoque;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 2 - PRODUTOS
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE PRODUTOS
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
    const tabelaProdutos = document.getElementById("listaProdutos");

    if (tabelaProdutos) {
        carregarTabelaProdutos();
    }
});

// =====================================================
// ABRIR CADASTRO
// =====================================================

function abrirCadastro() {

    const cadastro =
        document.getElementById(
            "cadastroProduto"
        );

    if (!cadastro) {
        return;
    }

    cadastro.style.display =
        "block";

}


// =====================================================
// FECHAR CADASTRO
// =====================================================

function fecharCadastro() {

    const cadastro =
        document.getElementById(
            "cadastroProduto"
        );

    if (!cadastro) {
        return;
    }

    cadastro.style.display =
        "none";

}


// =====================================================
// SALVAR PRODUTO MANUALMENTE
// =====================================================

function salvarProduto() {

    const campoCodigo = document.getElementById("codigo");
    const campoDescricao = document.getElementById("descricao");
    const campoCliente = document.getElementById("cliente");
    const campoQuantidade = document.getElementById("quantidade");
    const campoEndereco = document.getElementById("endereco");
    const campoNF = document.getElementById("nf");
    const campoValorTotal = document.getElementById("valorTotal") || document.getElementById("valor");

    if (!campoCodigo || !campoDescricao || !campoQuantidade || !campoEndereco) {
        alert("Os campos do cadastro não foram encontrados.");
        return;
    }

    const codigo = normalizarCodigo(campoCodigo.value);
    const descricao = String(campoDescricao.value || "").trim();
    const cliente = String(campoCliente ? campoCliente.value : "SMI").trim() || "SMI";
    const quantidade = converterNumero(campoQuantidade.value);
    const endereco = normalizarEndereco(campoEndereco.value);
    const nf = String(campoNF ? campoNF.value : "").trim();
    const valorTotal = converterNumero(campoValorTotal ? campoValorTotal.value : 0);

    if (codigo === "") { alert("Digite o código do produto."); campoCodigo.focus(); return; }
    if (descricao === "") { alert("Digite a descrição do produto."); campoDescricao.focus(); return; }
    if (!Number.isFinite(quantidade) || quantidade < 0) { alert("Digite uma quantidade válida."); campoQuantidade.focus(); return; }
    if (endereco === "") { alert("Digite o endereço do produto."); campoEndereco.focus(); return; }

    const estoque = carregarEstoque();
    const produtoExistente = estoque.find(function (produto) {
        return normalizarCodigo(produto.codigo) === codigo && normalizarEndereco(produto.endereco) === endereco;
    });

    if (produtoExistente) {
        const confirmou = confirm("Este produto já existe nesta posição.\n\nDeseja somar a quantidade informada ao saldo atual?");
        if (!confirmou) return;
        produtoExistente.quantidade = converterNumero(produtoExistente.quantidade) + quantidade;
        produtoExistente.descricao = descricao;
        produtoExistente.cliente = cliente;
        produtoExistente.nf = nf || produtoExistente.nf || "";
        produtoExistente.valorTotal = valorTotal || converterNumero(produtoExistente.valorTotal);
    } else {
        estoque.push({ nf, codigo, descricao, cliente, quantidade, valorTotal, endereco });
    }

    if (!salvarEstoque(estoque)) return;
    alert("Produto salvo com sucesso.");
    limparFormularioProduto();
    fecharCadastro();
    carregarTabelaProdutos();
}

// =====================================================
// LIMPAR FORMULÁRIO
// =====================================================

function limparFormularioProduto() {

    const ids = [
        "nf",
        "codigo",
        "descricao",
        "cliente",
        "quantidade",
        "valorTotal",
        "valor",
        "endereco"
    ];


    ids.forEach(
        function (id) {

            const campo =
                document.getElementById(
                    id
                );

            if (campo) {
                campo.value = "";
            }

        }
    );

}


// =====================================================
// CARREGAR TABELA DE PRODUTOS
// =====================================================

function carregarTabelaProdutos() {

        if (
        typeof window.carregarTabelaProdutosSupabase === "function"
    ) {
        return window.carregarTabelaProdutosSupabase();
    }

    const tabela =
        document.getElementById(
            "listaProdutos"
        );


    if (!tabela) {
        return;
    }


    const estoque =
        carregarEstoque();
        estoque.sort(function (a, b) {

    const enderecoA =
        String(a.endereco || "")
            .trim()
            .toUpperCase();

    const enderecoB =
        String(b.endereco || "")
            .trim()
            .toUpperCase();


    const partesA =
        enderecoA.match(/^(\d+)([A-Z]+)$/);

    const partesB =
        enderecoB.match(/^(\d+)([A-Z]+)$/);


    /*
      Endereços fora do padrão ficam no final.
    */

    if (!partesA && !partesB) {
        return enderecoA.localeCompare(enderecoB);
    }

    if (!partesA) {
        return 1;
    }

    if (!partesB) {
        return -1;
    }


    const numeroA =
        Number(partesA[1]);

    const numeroB =
        Number(partesB[1]);


    if (numeroA !== numeroB) {

        return numeroA - numeroB;

    }


    const letraA =
        partesA[2];

    const letraB =
        partesB[2];


    return letraA.localeCompare(
        letraB,
        "pt-BR"
    );

});


    tabela.innerHTML = "";


    if (estoque.length === 0) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='7' " +
                    "class='produtos-vazio'" +
                ">" +
                    "Nenhum produto cadastrado." +
                "</td>" +
            "</tr>";

        return;

    }


    estoque.forEach(
        function (
            produto,
            indice
        ) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.dataset.indice =
                indice;


            linha.dataset.codigo =
                normalizarCodigo(
                    produto.codigo
                );


            linha.appendChild(
                criarCelula(
                    produto.codigo || "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    produto.descricao ||
                    "Sem descrição"
                )
            );


            const celulaCliente =
                document.createElement(
                    "td"
                );


            const cliente =
                document.createElement(
                    "span"
                );


            cliente.className =
                "cliente-produto";


            cliente.textContent =
                produto.cliente ||
                "SMI";


            celulaCliente.appendChild(
                cliente
            );


            linha.appendChild(
                celulaCliente
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        produto.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    converterNumero(
                        produto.valorTotal
                    ).toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    )
                )
            );


            const celulaEndereco =
                document.createElement(
                    "td"
                );


            const endereco =
                document.createElement(
                    "span"
                );


            endereco.className =
                "endereco-produto";


            endereco.textContent =
                produto.endereco ||
                "-";


            celulaEndereco.appendChild(
                endereco
            );


            linha.appendChild(
                celulaEndereco
            );


            const celulaAcoes =
                document.createElement(
                    "td"
                );


            const acoes =
                document.createElement(
                    "div"
                );


            acoes.className =
                "acoes-produto";


            const botaoEditar =
                document.createElement(
                    "button"
                );


            botaoEditar.type =
                "button";


            botaoEditar.className =
                "btn-editar-produto";


            botaoEditar.textContent =
                "✏️";


            botaoEditar.title =
                "Editar produto";


            botaoEditar.addEventListener(
                "click",
                function () {

                    editarProduto(
                        produto.codigo,
                        indice
                    );

                }
            );


            const botaoExcluir =
                document.createElement(
                    "button"
                );


            botaoExcluir.type =
                "button";


            botaoExcluir.className =
                "btn-excluir-produto";


            botaoExcluir.textContent =
                "🗑️";


            botaoExcluir.title =
                "Excluir produto";


            botaoExcluir.addEventListener(
                "click",
                function () {

                    excluirProduto(
                        produto.codigo,
                        indice
                    );

                }
            );


            acoes.appendChild(
                botaoEditar
            );


            acoes.appendChild(
                botaoExcluir
            );


            celulaAcoes.appendChild(
                acoes
            );


            linha.appendChild(
                celulaAcoes
            );


            tabela.appendChild(
                linha
            );

        }
    );

    carregarFiltroClientesProdutos();

}


// =====================================================
// EDITAR PRODUTO
// =====================================================

function editarProduto(
    codigo,
    indice
) {

    const estoque =
        carregarEstoque();


    let indiceProduto =
        Number.isInteger(indice)
            ? indice
            : -1;


    if (
        indiceProduto < 0 ||
        !estoque[indiceProduto]
    ) {

        indiceProduto =
            estoque.findIndex(
                function (produto) {

                    return (
                        normalizarCodigo(
                            produto.codigo
                        ) ===
                        normalizarCodigo(
                            codigo
                        )
                    );

                }
            );

    }


    if (
        indiceProduto < 0 ||
        !estoque[indiceProduto]
    ) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const produto =
        estoque[indiceProduto];


    const novaDescricao =
        prompt(
            "Descrição do produto:",
            produto.descricao || ""
        );


    if (novaDescricao === null) {
        return;
    }


    const novaQuantidade =
        prompt(
            "Quantidade:",
            produto.quantidade ?? 0
        );


    if (novaQuantidade === null) {
        return;
    }


    const novoValorTotal =
        prompt(
            "Valor Total:",
            produto.valorTotal ?? 0
        );


    if (novoValorTotal === null) {
        return;
    }


    const novoEndereco =
        prompt(
            "Endereço:",
            produto.endereco || ""
        );


    if (novoEndereco === null) {
        return;
    }


    produto.descricao =
        String(
            novaDescricao || ""
        ).trim() ||
        "Sem descrição";


    produto.quantidade =
        converterNumero(
            novaQuantidade
        );


    produto.valorTotal =
        converterNumero(
            novoValorTotal
        );


    produto.endereco =
        normalizarEndereco(
            novoEndereco
        );


    estoque[indiceProduto] =
        produto;


    const salvou =
        salvarEstoque(
            estoque
        );


    if (!salvou) {
        return;
    }


    alert(
        "Produto atualizado com sucesso."
    );


    carregarTabelaProdutos();

}


// =====================================================
// EXCLUIR PRODUTO
// =====================================================

function excluirProduto(
    codigo,
    indice
) {

    const estoque =
        carregarEstoque();


    let indiceProduto =
        Number.isInteger(indice)
            ? indice
            : -1;


    if (
        indiceProduto < 0 ||
        !estoque[indiceProduto]
    ) {

        indiceProduto =
            estoque.findIndex(
                function (produto) {

                    return (
                        normalizarCodigo(
                            produto.codigo
                        ) ===
                        normalizarCodigo(
                            codigo
                        )
                    );

                }
            );

    }


    if (
        indiceProduto < 0 ||
        !estoque[indiceProduto]
    ) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const produto =
        estoque[indiceProduto];


    const confirmou =
        confirm(
            "Deseja excluir este registro?\n\n" +
            "Código: " +
            (
                produto.codigo ||
                "-"
            ) +
            "\nDescrição: " +
            (
                produto.descricao ||
                "-"
            ) +
            "\nEndereço: " +
            (
                produto.endereco ||
                "-"
            )
        );


    if (!confirmou) {
        return;
    }


    estoque.splice(
        indiceProduto,
        1
    );


    const salvou =
        salvarEstoque(
            estoque
        );


    if (!salvou) {
        return;
    }


    alert(
        "Produto excluído com sucesso."
    );


    carregarTabelaProdutos();

}


// =====================================================
// PESQUISAR PRODUTO
// =====================================================

function pesquisarProduto() {

    const campo =
        document.getElementById(
            "pesquisa"
        );


    if (!campo) {
        return;
    }


    const pesquisa =
        String(
            campo.value || ""
        )
        .trim()
        .toLowerCase();


    const linhas =
        document.querySelectorAll(
            "#listaProdutos tr"
        );


    linhas.forEach(
        function (linha) {

            const conteudo =
                String(
                    linha.textContent ||
                    ""
                ).toLowerCase();


            linha.style.display =
                conteudo.includes(
                    pesquisa
                )
                    ? ""
                    : "none";

        }
    );

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.abrirCadastro =
    abrirCadastro;

window.fecharCadastro =
    fecharCadastro;

window.salvarProduto =
    salvarProduto;

window.carregarTabelaProdutos =
    carregarTabelaProdutos;

window.editarProduto =
    editarProduto;

window.excluirProduto =
    excluirProduto;

window.pesquisarProduto =
    pesquisarProduto;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 3 - IMPORTAÇÃO DE EXCEL E JSON
// =====================================================


// =====================================================
// INICIALIZAÇÃO DO BOTÃO DE IMPORTAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botaoImportar =
            document.getElementById(
                "btnImportarProdutos"
            ) ||
            document.querySelector(
                "button[onclick*='executarImportacaoProdutos']"
            );

        if (botaoImportar) {

            botaoImportar.onclick =
                executarImportacaoProdutos;

        }

    }
);


// =====================================================
// INICIAR IMPORTAÇÃO
// =====================================================

function executarImportacaoProdutos() {

    const campoArquivo =
        document.getElementById(
            "arquivoExcel"
        );


    if (
        !campoArquivo ||
        !campoArquivo.files ||
        campoArquivo.files.length === 0
    ) {

        alert(
            "Selecione uma planilha antes de importar."
        );

        return;

    }


    const arquivo =
        campoArquivo.files[0];


    const extensao =
        String(
            arquivo.name || ""
        )
        .split(".")
        .pop()
        .toLowerCase();


    if (
        extensao !== "xlsx" &&
        extensao !== "xls" &&
        extensao !== "json"
    ) {

        alert(
            "Formato inválido.\n\n" +
            "Selecione um arquivo XLSX, XLS ou JSON."
        );

        campoArquivo.value = "";

        return;

    }


    if (extensao === "json") {

        importarProdutosJSON(
            arquivo
        );

        return;

    }


    importarProdutosExcel(
        arquivo
    );

}


// =====================================================
// IMPORTAR PLANILHA EXCEL
// =====================================================

function importarProdutosExcel(
    arquivo
) {

    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca XLSX não foi carregada.\n\n" +
            "Verifique se o produtos.html possui a biblioteca do Excel."
        );

        return;

    }


    const leitor =
        new FileReader();


    leitor.onload =
        function (evento) {

            try {

                const dados =
                    new Uint8Array(
                        evento.target.result
                    );


                const workbook =
                    XLSX.read(
                        dados,
                        {
                            type: "array"
                        }
                    );


                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    alert(
                        "A planilha não possui nenhuma aba."
                    );

                    return;

                }


                const nomePlanilha =
                    workbook.SheetNames[0];


                const planilha =
                    workbook.Sheets[
                        nomePlanilha
                    ];


                const linhas =
                    XLSX.utils.sheet_to_json(
                        planilha,
                        {
                            defval: "",
                           raw: true
                        }
                    );


                if (
                    !Array.isArray(linhas) ||
                    linhas.length === 0
                ) {

                    alert(
                        "A planilha está vazia."
                    );

                    return;

                }


               window.processarProdutosImportados(
    linhas
);

            } catch (erro) {

                console.error(
                    "Erro ao importar Excel:",
                    erro
                );


                alert(
                    "Não foi possível importar a planilha.\n\n" +
                    "Confira se o arquivo está preenchido corretamente."
                );

            }

        };


    leitor.onerror =
        function () {

            alert(
                "Não foi possível ler o arquivo selecionado."
            );

        };


    leitor.readAsArrayBuffer(
        arquivo
    );

}


// =====================================================
// IMPORTAR JSON
// =====================================================

function importarProdutosJSON(
    arquivo
) {

    const leitor =
        new FileReader();


    leitor.onload =
        function (evento) {

            try {

                const dados =
                    JSON.parse(
                        evento.target.result
                    );


                const linhas =
                    Array.isArray(dados)
                        ? dados
                        : dados.estoque ||
                          dados.produtos ||
                          [];


                if (
                    !Array.isArray(linhas) ||
                    linhas.length === 0
                ) {

                    alert(
                        "O arquivo JSON não possui produtos válidos."
                    );

                    return;

                }


              window.processarProdutosImportados(
    linhas
);

            } catch (erro) {

                console.error(
                    "Erro ao importar JSON:",
                    erro
                );


                alert(
                    "O arquivo JSON é inválido."
                );

            }

        };


    leitor.onerror =
        function () {

            alert(
                "Não foi possível ler o arquivo JSON."
            );

        };


    leitor.readAsText(
        arquivo,
        "UTF-8"
    );

}


// =====================================================
// PROCESSAR PRODUTOS IMPORTADOS
// =====================================================

function processarProdutosImportados(
    linhas
) {

    const produtosValidos = [];


    linhas.forEach(
        function (
            linha,
            indice
        ) {

            const produto =
                normalizarProdutoImportado(
                    linha
                );
                console.log(
    "PRODUTO IMPORTADO:",
    produto
);


            const linhaValida =
                produto.codigo !== "" ||
                produto.descricao !== "" ||
                produto.nf !== "" ||
                produto.endereco !== "";


            if (!linhaValida) {

                console.warn(
                    "Linha ignorada:",
                    indice + 2,
                    linha
                );

                return;

            }


            produtosValidos.push(
                produto
            );

        }
    );


    if (
        produtosValidos.length === 0
    ) {

        alert(
            "Nenhum produto válido foi reconhecido.\n\n" +
            "Confira os nomes das colunas da planilha."
        );

        return;

    }


    const estoqueAtual =
        carregarEstoque();


    let estoqueFinal =
        produtosValidos;


    if (
        estoqueAtual.length > 0
    ) {

        const substituir =
            confirm(
                "Já existem produtos cadastrados.\n\n" +
                "Clique em OK para SUBSTITUIR o estoque atual.\n" +
                "Clique em Cancelar para ACRESCENTAR os novos produtos."
            );


        estoqueFinal =
            substituir
                ? produtosValidos
                : estoqueAtual.concat(
                    produtosValidos
                );

    }


    const salvou =
        salvarEstoque(
            estoqueFinal
        );


    if (!salvou) {
        return;
    }


    const campoArquivo =
        document.getElementById(
            "arquivoExcel"
        );


    if (campoArquivo) {
        campoArquivo.value = "";
    }


    if (
        typeof carregarTabelaProdutos ===
        "function"
    ) {

        carregarTabelaProdutos();

    }


    alert(
        produtosValidos.length +
        " produto(s) importado(s) com sucesso!"
    );

}


// =====================================================
// NORMALIZAR PRODUTO IMPORTADO
// =====================================================

function normalizarProdutoImportado(
    linha
) {

    return {

        nf:
            obterValorColuna(
                linha,
                [
                    "NF",
                    "Nota Fiscal",
                    "Nota",
                    "Número da NF",
                    "Numero da NF",
                    "Nº NF"
                ]
            ),


        codigo:
            normalizarCodigo(
                obterValorColuna(
                    linha,
                    [
                        "CODIGO",
                        "Código",
                        "Codigo",
                        "Cód.",
                        "Cod",
                        "SKU",
                        "Material",
                        "Código do Produto",
                        "Codigo do Produto"
                    ]
                )
            ),


        descricao:
            obterValorColuna(
                linha,
                [
                    "DESCRICAO",
                    "Descrição",
                    "Descricao",
                    "Desc.",
                    "Produto",
                    "Nome do Produto",
                    "Descrição do Produto",
                    "Descricao do Produto"
                ]
            ),


        cliente:
            obterValorColuna(
                linha,
                [
                    "CLIENTE",
                    "Cliente",
                    "Depositante",
                    "Proprietário",
                    "Proprietario",
                    "Empresa"
                ]
            ) || "SMI",


        quantidade:
            converterNumero(
                obterValorColuna(
                    linha,
                    [
                        "QUANTIDADE",
                        "Quantidade",
                        "Qtd",
                        "Qtde",
                        "QTD",
                        "Saldo",
                        "Estoque",
                        "Quantidade Atual"
                    ]
                )
            ),


        valorTotal:
            converterNumero(
                obterValorColuna(
                    linha,
                    [
                        "VALOR TOTAL",
                        "Valor Total",
                        "ValorTotal",
                        "Total",
                        "Valor do Estoque"
                    ]
                )
            ),


        endereco:
            normalizarEndereco(
                obterValorColuna(
                    linha,
                    [
                        "POSICAO",
                        "Posição",
                        "Posicao",
                        "Endereço",
                        "Endereco",
                        "Localização",
                        "Localizacao",
                        "Rua",
                        "Local"
                    ]
                )
            )

    };

}


// =====================================================
// LOCALIZAR COLUNA DA PLANILHA
// =====================================================

function obterValorColuna(
    linha,
    nomesAceitos
) {

    if (
        !linha ||
        typeof linha !== "object"
    ) {

        return "";

    }


    const colunas =
        Object.keys(
            linha
        );


    for (
        const nomeAceito of nomesAceitos
    ) {

        const nomeNormalizado =
            normalizarNomeColuna(
                nomeAceito
            );


        const colunaEncontrada =
            colunas.find(
                function (coluna) {

                    return (
                        normalizarNomeColuna(
                            coluna
                        ) ===
                        nomeNormalizado
                    );

                }
            );


        if (
            colunaEncontrada !==
            undefined
        ) {

            const valor =
                linha[
                    colunaEncontrada
                ];


            if (
                valor !== undefined &&
                valor !== null &&
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }

    }


    return "";

}


// =====================================================
// NORMALIZAR NOME DA COLUNA
// =====================================================

function normalizarNomeColuna(
    texto
) {

    return String(
        texto || ""
    )
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /[^a-zA-Z0-9]/g,
        ""
    )
    .toLowerCase();

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.executarImportacaoProdutos =
    executarImportacaoProdutos;

window.importarProdutosExcel =
    importarProdutosExcel;

window.importarProdutosJSON =
    importarProdutosJSON;

window.processarProdutosImportados =
    processarProdutosImportados;

window.normalizarProdutoImportado =
    normalizarProdutoImportado;
    // =====================================================

// =====================================================
// SINCRONIZAÇÃO DAS MOVIMENTAÇÕES COM A TABELA PRODUTOS
// =====================================================

function obterClienteProdutosMovimentacao() {
    return window.supabaseClient || null;
}

async function buscarProdutosMovimentacaoSupabase(
    codigo,
    endereco
) {
    const supabase =
        obterClienteProdutosMovimentacao();

    if (!supabase) {
        alert(
            "A conexão com o banco online não foi carregada.\n\n" +
            "Verifique se a página possui supabase.js antes de app.js."
        );

        return null;
    }

    let consulta =
        supabase
            .from("produtos")
            .select("*")
            .eq("codigo", String(codigo || "").trim());

    if (endereco) {
        consulta =
            consulta.eq(
                "endereco",
                String(endereco || "")
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "")
            );
    }

    const { data, error } =
        await consulta.order("id", {
            ascending: true
        });

    if (error) {
        console.error(
            "Erro ao buscar produto no banco:",
            error
        );

        alert(
            "Não foi possível consultar o produto no banco online.\n\n" +
            error.message
        );

        return null;
    }

    return Array.isArray(data)
        ? data
        : [];
}

async function sincronizarEntradaProdutoSupabase(
    codigo,
    endereco,
    quantidade
) {
    const supabase =
        obterClienteProdutosMovimentacao();

    if (!supabase) {
        return false;
    }

    const registrosExatos =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            endereco
        );

    if (registrosExatos === null) {
        return false;
    }

    const quantidadeEntrada =
        converterNumero(quantidade);

    if (registrosExatos.length > 0) {
        const produto =
            registrosExatos[0];

        const quantidadeAtual =
            converterNumero(
                produto.quantidade
            );

        const valorAtual =
            converterNumero(
                produto.valor_total ??
                produto.valorTotal ??
                0
            );

        const valorUnitario =
            quantidadeAtual > 0
                ? valorAtual / quantidadeAtual
                : 0;

        const {
            data: produtoAtualizado,
            error
        } =
            await supabase
                .from("produtos")
                .update({
                    quantidade:
                        quantidadeAtual +
                        quantidadeEntrada,

                    valor_total:
                        valorAtual +
                        (
                            quantidadeEntrada *
                            valorUnitario
                        )
                })
                .eq("id", produto.id)
                .select(
                    "id, codigo, quantidade, endereco"
                )
                .maybeSingle();

        if (error) {
            console.error(
                "Erro ao atualizar entrada no banco:",
                error
            );

            alert(
                "A entrada não foi salva na base de produtos.\n\n" +
                error.message
            );

            return false;
        }

        if (!produtoAtualizado) {
            alert(
                "A entrada foi registrada no histórico, mas a tabela Produtos não foi alterada.\n\n" +
                "O Supabase não permitiu atualizar esse registro. Verifique a política de UPDATE da tabela produtos."
            );

            return false;
        }

        console.log(
            "PRODUTO ATUALIZADO NO SUPABASE:",
            produtoAtualizado
        );

        return true;
    }

    const referencias =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            ""
        );

    if (
        referencias === null ||
        referencias.length === 0
    ) {
        alert(
            "O produto não foi encontrado na base online."
        );

        return false;
    }

    const referencia =
        referencias[0];

    const quantidadeReferencia =
        converterNumero(
            referencia.quantidade
        );

    const valorReferencia =
        converterNumero(
            referencia.valor_total ??
            referencia.valorTotal ??
            0
        );

    const valorUnitario =
        quantidadeReferencia > 0
            ? valorReferencia /
              quantidadeReferencia
            : 0;

    const {
        data: produtoInserido,
        error
    } =
        await supabase
            .from("produtos")
            .insert([
                {
                    nf:
                        referencia.nf || "",

                    codigo:
                        referencia.codigo ||
                        codigo,

                    descricao:
                        referencia.descricao ||
                        "Sem descrição",

                    cliente:
                        referencia.cliente ||
                        "SMI",

                    quantidade:
                        quantidadeEntrada,

                    valor_total:
                        quantidadeEntrada *
                        valorUnitario,

                    endereco:
                        String(endereco || "")
                            .trim()
                            .toUpperCase()
                            .replace(/\s+/g, "")
                }
            ])
            .select(
                "id, codigo, quantidade, endereco"
            )
            .maybeSingle();

    if (error) {
        console.error(
            "Erro ao inserir entrada no banco:",
            error
        );

        alert(
            "A entrada não foi salva na base de produtos.\n\n" +
            error.message
        );

        return false;
    }

    if (!produtoInserido) {
        alert(
            "A nova posição não foi criada na tabela Produtos.\n\n" +
            "O Supabase não permitiu inserir esse registro. Verifique a política de INSERT da tabela produtos."
        );

        return false;
    }

    console.log(
        "PRODUTO INSERIDO NO SUPABASE:",
        produtoInserido
    );

    return true;
}

async function sincronizarSaidaProdutoSupabase(
    codigo,
    endereco,
    quantidade
) {
    const supabase =
        obterClienteProdutosMovimentacao();

    if (!supabase) {
        return false;
    }

    const registros =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            endereco || ""
        );

    if (registros === null) {
        return false;
    }

    const quantidadeSolicitada =
        converterNumero(quantidade);

    const saldoTotal =
        registros.reduce(
            function (total, produto) {
                return (
                    total +
                    converterNumero(
                        produto.quantidade
                    )
                );
            },
            0
        );

    if (saldoTotal < quantidadeSolicitada) {
        alert(
            "Saldo insuficiente na base online.\n\n" +
            "Saldo disponível: " +
            formatarQuantidade(saldoTotal)
        );

        return false;
    }

    let restante =
        quantidadeSolicitada;

    for (const produto of registros) {
        if (restante <= 0) {
            break;
        }

        const quantidadeAtual =
            converterNumero(
                produto.quantidade
            );

        const valorAtual =
            converterNumero(
                produto.valor_total ??
                produto.valorTotal ??
                0
            );

        const retirada =
            Math.min(
                quantidadeAtual,
                restante
            );

        const valorUnitario =
            quantidadeAtual > 0
                ? valorAtual /
                  quantidadeAtual
                : 0;

        const novaQuantidade =
            quantidadeAtual -
            retirada;

        const novoValor =
            Math.max(
                0,
                valorAtual -
                (
                    retirada *
                    valorUnitario
                )
            );

        let error;

        let produtoAlterado = null;

        if (novaQuantidade <= 0) {
            const resposta =
                await supabase
                    .from("produtos")
                    .delete()
                    .eq("id", produto.id)
                    .select(
                        "id, codigo, quantidade, endereco"
                    )
                    .maybeSingle();

            error = resposta.error;
            produtoAlterado = resposta.data;
        } else {
            const resposta =
                await supabase
                    .from("produtos")
                    .update({
                        quantidade:
                            novaQuantidade,

                        valor_total:
                            novoValor
                    })
                    .eq("id", produto.id)
                    .select(
                        "id, codigo, quantidade, endereco"
                    )
                    .maybeSingle();

            error = resposta.error;
            produtoAlterado = resposta.data;
        }

        if (error) {
            console.error(
                "Erro ao registrar saída no banco:",
                error
            );

            alert(
                "A saída não foi salva na base de produtos.\n\n" +
                error.message
            );

            return false;
        }

        if (!produtoAlterado) {
            alert(
                "A saída foi registrada no histórico, mas a tabela Produtos não foi alterada.\n\n" +
                "O Supabase não permitiu atualizar ou excluir esse registro. Verifique as políticas de UPDATE e DELETE da tabela produtos."
            );

            return false;
        }

        console.log(
            "PRODUTO ALTERADO NA SAÍDA:",
            produtoAlterado
        );

        restante -= retirada;
    }

    return true;
}

async function sincronizarTransferenciaProdutoSupabase(
    codigo,
    origem,
    destino,
    quantidade
) {
    const supabase =
        obterClienteProdutosMovimentacao();

    if (!supabase) {
        return false;
    }

    const origemNormalizada =
        normalizarEndereco(origem);

    const destinoNormalizado =
        normalizarEndereco(destino);

    const registrosOrigem =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            origemNormalizada
        );

    if (
        registrosOrigem === null ||
        registrosOrigem.length === 0
    ) {
        alert(
            "O produto não foi encontrado na posição de origem na base online."
        );

        return false;
    }

    const quantidadeTransferida =
        converterNumero(quantidade);

    const saldoOrigem =
        registrosOrigem.reduce(
            function (total, produto) {
                return (
                    total +
                    converterNumero(
                        produto.quantidade
                    )
                );
            },
            0
        );

    if (saldoOrigem < quantidadeTransferida) {
        alert(
            "Saldo insuficiente na posição de origem da base online."
        );

        return false;
    }

    const referencia =
        registrosOrigem[0];

    let restante =
        quantidadeTransferida;

    let valorTransferido =
        0;

    for (const produto of registrosOrigem) {
        if (restante <= 0) {
            break;
        }

        const quantidadeAtual =
            converterNumero(
                produto.quantidade
            );

        const valorAtual =
            converterNumero(
                produto.valor_total ??
                produto.valorTotal ??
                0
            );

        const retirada =
            Math.min(
                quantidadeAtual,
                restante
            );

        const valorUnitario =
            quantidadeAtual > 0
                ? valorAtual /
                  quantidadeAtual
                : 0;

        const valorRetirado =
            retirada *
            valorUnitario;

        const novaQuantidade =
            quantidadeAtual -
            retirada;

        const novoValor =
            Math.max(
                0,
                valorAtual -
                valorRetirado
            );

        let error;

        if (novaQuantidade <= 0) {
            const resposta =
                await supabase
                    .from("produtos")
                    .delete()
                    .eq("id", produto.id);

            error = resposta.error;
        } else {
            const resposta =
                await supabase
                    .from("produtos")
                    .update({
                        quantidade:
                            novaQuantidade,

                        valor_total:
                            novoValor
                    })
                    .eq("id", produto.id);

            error = resposta.error;
        }

        if (error) {
            console.error(
                "Erro ao retirar transferência da origem:",
                error
            );

            alert(
                "A transferência não foi salva na base de produtos.\n\n" +
                error.message
            );

            return false;
        }

        valorTransferido +=
            valorRetirado;

        restante -=
            retirada;
    }

    const registrosDestino =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            destinoNormalizado
        );

    if (registrosDestino === null) {
        return false;
    }

    if (registrosDestino.length > 0) {
        const produtoDestino =
            registrosDestino[0];

        const quantidadeDestino =
            converterNumero(
                produtoDestino.quantidade
            );

        const valorDestino =
            converterNumero(
                produtoDestino.valor_total ??
                produtoDestino.valorTotal ??
                0
            );

        const { error } =
            await supabase
                .from("produtos")
                .update({
                    quantidade:
                        quantidadeDestino +
                        quantidadeTransferida,

                    valor_total:
                        valorDestino +
                        valorTransferido
                })
                .eq(
                    "id",
                    produtoDestino.id
                );

        if (error) {
            console.error(
                "Erro ao atualizar destino da transferência:",
                error
            );

            alert(
                "A transferência não foi concluída na posição de destino.\n\n" +
                error.message
            );

            return false;
        }

        return true;
    }

    const { error } =
        await supabase
            .from("produtos")
            .insert([
                {
                    nf:
                        referencia.nf || "",

                    codigo:
                        referencia.codigo ||
                        codigo,

                    descricao:
                        referencia.descricao ||
                        "Sem descrição",

                    cliente:
                        referencia.cliente ||
                        "SMI",

                    quantidade:
                        quantidadeTransferida,

                    valor_total:
                        valorTransferido,

                    endereco:
                        destinoNormalizado
                }
            ]);

    if (error) {
        console.error(
            "Erro ao criar destino da transferência:",
            error
        );

        alert(
            "A transferência não foi concluída na base de produtos.\n\n" +
            error.message
        );

        return false;
    }

    return true;
}

window.sincronizarEntradaProdutoSupabase =
    sincronizarEntradaProdutoSupabase;

window.sincronizarSaidaProdutoSupabase =
    sincronizarSaidaProdutoSupabase;

window.sincronizarTransferenciaProdutoSupabase =
    sincronizarTransferenciaProdutoSupabase;


// =====================================================
// SMI WMS - APP.JS
// PARTE 4 - ENTRADAS DE ESTOQUE
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE ENTRADAS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tabelaEntradas =
            document.getElementById(
                "listaEntradas"
            );


        if (tabelaEntradas) {

            carregarHistoricoEntradas();

        }


        const botaoEntrada =
            document.getElementById(
                "btnRegistrarEntrada"
            );


        if (botaoEntrada) {

            botaoEntrada.addEventListener(
                "click",
                registrarEntrada
            );

        }


        const campoQuantidade =
            document.getElementById(
                "quantidadeEntrada"
            );


        if (campoQuantidade) {

            campoQuantidade.addEventListener(
                "keydown",
                function (evento) {

                    if (evento.key === "Enter") {

                        registrarEntrada();

                    }

                }
            );

        }

    }
);


// =====================================================
// REGISTRAR ENTRADA
// =====================================================

async function registrarEntrada() {

    const campoCodigo =
        document.getElementById(
            "codigoEntrada"
        );

    const campoQuantidade =
        document.getElementById(
            "quantidadeEntrada"
        );

    const campoEndereco =
        document.getElementById(
            "enderecoEntrada"
        );

    if (
        !campoCodigo ||
        !campoQuantidade ||
        !campoEndereco
    ) {
        alert(
            "Os campos da entrada não foram encontrados."
        );

        return;
    }

    const codigo =
        normalizarCodigo(
            campoCodigo.value
        );

    const quantidadeEntrada =
        converterNumero(
            campoQuantidade.value
        );

    const endereco =
        normalizarEndereco(
            campoEndereco.value
        );

    if (codigo === "") {
        alert(
            "Digite o código do produto."
        );

        campoCodigo.focus();
        return;
    }

    if (
        !Number.isFinite(
            quantidadeEntrada
        ) ||
        quantidadeEntrada <= 0
    ) {
        alert(
            "Digite uma quantidade válida."
        );

        campoQuantidade.focus();
        return;
    }

    if (endereco === "") {
        alert(
            "Digite o endereço de armazenagem."
        );

        campoEndereco.focus();
        return;
    }

    if (!window.supabaseClient) {
        alert(
            "A conexão com o banco online não foi carregada."
        );

        return;
    }

    const produtosMesmoCodigo =
        await buscarProdutosMovimentacaoSupabase(
            codigo,
            ""
        );

    if (
        produtosMesmoCodigo === null ||
        produtosMesmoCodigo.length === 0
    ) {
        alert(
            'O produto "' +
            codigo +
            '" não foi encontrado na base online.'
        );

        campoCodigo.focus();
        return;
    }

    const produtoReferencia =
        produtosMesmoCodigo[0];

    const sincronizouBanco =
        await sincronizarEntradaProdutoSupabase(
            codigo,
            endereco,
            quantidadeEntrada
        );

    if (!sincronizouBanco) {
        return;
    }

    const estoque =
        carregarEstoque();

    const produtoNaPosicao =
        estoque.find(
            function (produto) {
                return (
                    normalizarCodigo(
                        produto.codigo
                    ) === codigo &&
                    normalizarEndereco(
                        produto.endereco
                    ) === endereco
                );
            }
        );

    const quantidadeReferencia =
        converterNumero(
            produtoReferencia.quantidade
        );

    const valorTotalReferencia =
        converterNumero(
            produtoReferencia.valor_total ??
            produtoReferencia.valorTotal ??
            0
        );

    const valorUnitarioReferencia =
        quantidadeReferencia > 0
            ? valorTotalReferencia /
              quantidadeReferencia
            : 0;

                if (produtoNaPosicao) {

        const quantidadeAnterior =
            converterNumero(
                produtoNaPosicao.quantidade
            );

        const valorTotalAnterior =
            converterNumero(
                produtoNaPosicao.valorTotal
            );

        produtoNaPosicao.quantidade =
            quantidadeAnterior +
            quantidadeEntrada;

        produtoNaPosicao.valorTotal =
            valorTotalAnterior +
            (
                quantidadeEntrada *
                valorUnitarioReferencia
            );

    } else {

        estoque.push({
            nf:
                produtoReferencia.nf ||
                "",

            codigo:
                produtoReferencia.codigo ||
                codigo,

            descricao:
                produtoReferencia.descricao ||
                "Sem descrição",

            cliente:
                produtoReferencia.cliente ||
                "SMI",

            quantidade:
                quantidadeEntrada,

            valorTotal:
                quantidadeEntrada *
                valorUnitarioReferencia,

            endereco:
                endereco
        });
    }

    salvarEstoque(
        estoque
    );

    const movimentacao = {
        tipo:
            "ENTRADA",

        codigo:
            produtoReferencia.codigo ||
            codigo,

        descricao:
            produtoReferencia.descricao ||
            "Sem descrição",

        quantidade:
            quantidadeEntrada,

        endereco:
            endereco,

        origem:
            "Recebimento",

        destino:
            endereco,

        cliente:
            produtoReferencia.cliente ||
            "SMI",

        data:
            obterDataHoraAtual(),

        operador:
            obterNomeUsuario()
    };

    salvarHistoricoEntrada(
        movimentacao
    );

    salvarMovimentacaoGeral(
        movimentacao
    );

    limparCamposEntrada();

    carregarHistoricoEntradas();

    if (
        typeof window
            .carregarTabelaProdutosSupabase ===
        "function"
    ) {
        await window
            .carregarTabelaProdutosSupabase();
    }

        alert(
        "Entrada registrada e confirmada na base de Produtos!\n\n" +
        "Código: " +
        movimentacao.codigo +
        "\nQuantidade: " +
        formatarQuantidade(
            quantidadeEntrada
        ) +
        "\nEndereço: " +
        endereco
    );

    campoCodigo.focus();
}

// =====================================================
// SALVAR HISTÓRICO DE ENTRADAS
// =====================================================

function salvarHistoricoEntrada(
    movimentacao
) {

    const entradas =
        carregarListaLocalStorage(
            "entradas"
        );

    entradas.unshift(
        movimentacao
    );

    salvarListaLocalStorage(
        "entradas",
        entradas
    );
}


// =====================================================
// SALVAR MOVIMENTAÇÃO GERAL
// =====================================================

function salvarMovimentacaoGeral(
    movimentacao
) {

    const movimentacoes =
        carregarListaLocalStorage(
            "movimentacoes"
        );

    movimentacoes.unshift(
        movimentacao
    );

    salvarListaLocalStorage(
        "movimentacoes",
        movimentacoes
    );
}

// =====================================================
// CARREGAR HISTÓRICO DE ENTRADAS
// =====================================================

function carregarHistoricoEntradas() {

    const tabela =
        document.getElementById(
            "listaEntradas"
        );


    if (!tabela) {

        return;

    }


    const entradas =
        carregarListaLocalStorage(
            "entradas"
        );


    tabela.innerHTML = "";


    if (entradas.length === 0) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='6' " +
                    "style='text-align:center;'" +
                ">" +
                    "Nenhuma entrada registrada." +
                "</td>" +
            "</tr>";

        return;

    }


    entradas.forEach(
        function (entrada) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.appendChild(
                criarCelula(
                    entrada.codigo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    entrada.descricao ||
                    "Sem descrição"
                )
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        entrada.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    entrada.endereco ||
                    entrada.destino ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    entrada.data ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    entrada.operador ||
                    "Administrador"
                )
            );


            tabela.appendChild(
                linha
            );

        }
    );

}


// =====================================================
// LIMPAR CAMPOS DA ENTRADA
// =====================================================

function limparCamposEntrada() {

    const campos = [
        "codigoEntrada",
        "quantidadeEntrada",
        "enderecoEntrada"
    ];


    campos.forEach(
        function (id) {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.value = "";

            }

        }
    );

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.registrarEntrada =
    registrarEntrada;

window.salvarHistoricoEntrada =
    salvarHistoricoEntrada;

window.salvarMovimentacaoGeral =
    salvarMovimentacaoGeral;

window.carregarHistoricoEntradas =
    carregarHistoricoEntradas;

window.carregarEntradas =
    carregarHistoricoEntradas;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 5 - SAÍDAS DE ESTOQUE
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE SAÍDAS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tabelaSaidas =
            document.getElementById(
                "listaSaidas"
            );

        if (tabelaSaidas) {

            carregarHistoricoSaidas();

        }


        const botaoSaida =
            document.getElementById(
                "btnRegistrarSaida"
            );

        if (botaoSaida) {

            botaoSaida.addEventListener(
                "click",
                registrarSaida
            );

        }


        const campoQuantidade =
            document.getElementById(
                "quantidadeSaida"
            );

        if (campoQuantidade) {

            campoQuantidade.addEventListener(
                "keydown",
                function (evento) {

                    if (evento.key === "Enter") {

                        registrarSaida();

                    }

                }
            );

        }

    }
);


// =====================================================
// REGISTRAR SAÍDA
// =====================================================

async function registrarSaida() {

    const campoCodigo =
        document.getElementById(
            "codigoSaida"
        );

    const campoQuantidade =
        document.getElementById(
            "quantidadeSaida"
        );

    const campoEndereco =
        document.getElementById(
            "enderecoSaida"
        );


    if (
        !campoCodigo ||
        !campoQuantidade
    ) {

        alert(
            "Os campos da saída não foram encontrados."
        );

        return;

    }


    const codigo =
        normalizarCodigo(
            campoCodigo.value
        );


    const quantidadeSolicitada =
        converterNumero(
            campoQuantidade.value
        );


    const enderecoInformado =
        campoEndereco
            ? normalizarEndereco(
                campoEndereco.value
            )
            : "";


    if (codigo === "") {

        alert(
            "Digite o código do produto."
        );

        campoCodigo.focus();

        return;

    }


    if (
        !Number.isFinite(
            quantidadeSolicitada
        ) ||
        quantidadeSolicitada <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        campoQuantidade.focus();

        return;

    }


    const estoque =
        carregarEstoque();


    let registrosProduto =
        estoque
            .map(
                function (
                    produto,
                    indice
                ) {

                    return {
                        produto: produto,
                        indice: indice
                    };

                }
            )
            .filter(
                function (item) {

                    const mesmoCodigo =
                        normalizarCodigo(
                            item.produto.codigo
                        ) === codigo;

                    const mesmaPosicao =
                        enderecoInformado === "" ||
                        normalizarEndereco(
                            item.produto.endereco
                        ) === enderecoInformado;

                    return (
                        mesmoCodigo &&
                        mesmaPosicao
                    );

                }
            );


    if (registrosProduto.length === 0) {

        alert(
            'O produto "' +
            codigo +
            '" não foi encontrado no estoque.'
        );

        campoCodigo.focus();

        return;

    }


    const saldoDisponivel =
        registrosProduto.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    converterNumero(
                        item.produto.quantidade
                    )
                );

            },
            0
        );


    if (
        quantidadeSolicitada >
        saldoDisponivel
    ) {

        alert(
            "Saldo insuficiente.\n\n" +
            "Código: " +
            codigo +
            "\nSaldo disponível: " +
            formatarQuantidade(
                saldoDisponivel
            )
        );

        return;

    }


    const produtoReferencia =
        registrosProduto[0].produto;


    let quantidadeRestante =
        quantidadeSolicitada;


    let valorTotalRetirado =
        0;


    registrosProduto.forEach(
        function (item) {

            if (quantidadeRestante <= 0) {

                return;

            }


            const produto =
                item.produto;


            const quantidadeAtual =
                converterNumero(
                    produto.quantidade
                );


            const valorTotalAtual =
                converterNumero(
                    produto.valorTotal
                );


            const valorUnitario =
                quantidadeAtual > 0
                    ? valorTotalAtual /
                      quantidadeAtual
                    : 0;


            const quantidadeRetirada =
                Math.min(
                    quantidadeAtual,
                    quantidadeRestante
                );


            const valorRetirado =
                quantidadeRetirada *
                valorUnitario;


            produto.quantidade =
                quantidadeAtual -
                quantidadeRetirada;


            produto.valorTotal =
                Math.max(
                    0,
                    valorTotalAtual -
                    valorRetirado
                );


            valorTotalRetirado +=
                valorRetirado;


            quantidadeRestante -=
                quantidadeRetirada;

        }
    );


    const estoqueAtualizado =
        estoque.filter(
            function (produto) {

                return (
                    converterNumero(
                        produto.quantidade
                    ) > 0
                );

            }
        );


    const sincronizouBanco =
        await sincronizarSaidaProdutoSupabase(
            codigo,
            enderecoInformado,
            quantidadeSolicitada
        );

    if (!sincronizouBanco) {
        return;
    }

    const salvou =
        salvarEstoque(
            estoqueAtualizado
        );


    if (!salvou) {

        return;

    }


    const movimentacao = {

        tipo:
            "SAIDA",

        codigo:
            produtoReferencia.codigo ||
            codigo,

        descricao:
            produtoReferencia.descricao ||
            "Sem descrição",

        quantidade:
            quantidadeSolicitada,

        valorTotal:
            valorTotalRetirado,

        origem:
            enderecoInformado ||
            produtoReferencia.endereco ||
            "-",

        destino:
            "Expedição",

        endereco:
            enderecoInformado ||
            produtoReferencia.endereco ||
            "-",

        cliente:
            produtoReferencia.cliente ||
            "SMI",

        data:
            obterDataHoraAtual(),

        operador:
            obterNomeUsuario()

    };


    salvarHistoricoSaida(
        movimentacao
    );


    salvarMovimentacaoGeral(
        movimentacao
    );


    limparCamposSaida();


    carregarHistoricoSaidas();


    alert(
        "Saída registrada com sucesso!\n\n" +
        "Código: " +
        movimentacao.codigo +
        "\nQuantidade: " +
        formatarQuantidade(
            quantidadeSolicitada
        ) +
        "\nValor retirado: " +
        converterNumero(
            valorTotalRetirado
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
    );


    campoCodigo.focus();

}


// =====================================================
// SALVAR HISTÓRICO DE SAÍDAS
// =====================================================

function salvarHistoricoSaida(
    movimentacao
) {

    const saidas =
        carregarListaLocalStorage(
            "saidas"
        );


    saidas.unshift(
        movimentacao
    );


    salvarListaLocalStorage(
        "saidas",
        saidas
    );

}


// =====================================================
// CARREGAR HISTÓRICO DE SAÍDAS
// =====================================================

function carregarHistoricoSaidas() {

    const tabela =
        document.getElementById(
            "listaSaidas"
        );


    if (!tabela) {

        return;

    }


    const saidas =
        carregarListaLocalStorage(
            "saidas"
        );


    tabela.innerHTML = "";


    if (saidas.length === 0) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='6' " +
                    "style='text-align:center;'" +
                ">" +
                    "Nenhuma saída registrada." +
                "</td>" +
            "</tr>";

        return;

    }


    saidas.forEach(
        function (saida) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.appendChild(
                criarCelula(
                    saida.codigo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    saida.descricao ||
                    "Sem descrição"
                )
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        saida.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    saida.origem ||
                    saida.endereco ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    saida.data ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    saida.operador ||
                    "Administrador"
                )
            );


            tabela.appendChild(
                linha
            );

        }
    );

}


// =====================================================
// LIMPAR CAMPOS DA SAÍDA
// =====================================================

function limparCamposSaida() {

    const campos = [
        "codigoSaida",
        "quantidadeSaida",
        "enderecoSaida"
    ];


    campos.forEach(
        function (id) {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.value = "";

            }

        }
    );

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.registrarSaida =
    registrarSaida;

window.salvarHistoricoSaida =
    salvarHistoricoSaida;

window.carregarHistoricoSaidas =
    carregarHistoricoSaidas;

window.carregarSaidas =
    carregarHistoricoSaidas;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 6 - TRANSFERÊNCIAS
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE TRANSFERÊNCIAS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tabelaTransferencias =
            document.getElementById(
                "listaTransferencias"
            );


        if (tabelaTransferencias) {

            carregarHistoricoTransferencias();

        }


        const botaoTransferencia =
            document.getElementById(
                "btnRegistrarTransferencia"
            );


        if (botaoTransferencia) {

            botaoTransferencia.addEventListener(
                "click",
                registrarTransferencia
            );

        }


        const campoQuantidade =
            document.getElementById(
                "quantidadeTransferencia"
            );


        if (campoQuantidade) {

            campoQuantidade.addEventListener(
                "keydown",
                function (evento) {

                    if (evento.key === "Enter") {

                        registrarTransferencia();

                    }

                }
            );

        }

    }
);


// =====================================================
// REGISTRAR TRANSFERÊNCIA
// =====================================================

async function registrarTransferencia() {

    const campoCodigo =
        document.getElementById(
            "codigoTransferencia"
        );


    const campoQuantidade =
        document.getElementById(
            "quantidadeTransferencia"
        );


    const campoOrigem =
        document.getElementById(
            "origemTransferencia"
        ) ||
        document.getElementById(
            "enderecoOrigem"
        );


    const campoDestino =
        document.getElementById(
            "destinoTransferencia"
        ) ||
        document.getElementById(
            "enderecoDestino"
        );


    if (
        !campoCodigo ||
        !campoQuantidade ||
        !campoOrigem ||
        !campoDestino
    ) {

        alert(
            "Os campos da transferência não foram encontrados."
        );

        return;

    }


    const codigo =
        normalizarCodigo(
            campoCodigo.value
        );


    const quantidadeTransferida =
        converterNumero(
            campoQuantidade.value
        );


    const origem =
        normalizarEndereco(
            campoOrigem.value
        );


    const destino =
        normalizarEndereco(
            campoDestino.value
        );


    if (codigo === "") {

        alert(
            "Digite o código do produto."
        );

        campoCodigo.focus();

        return;

    }


    if (
        !Number.isFinite(
            quantidadeTransferida
        ) ||
        quantidadeTransferida <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        campoQuantidade.focus();

        return;

    }


    if (origem === "") {

        alert(
            "Digite a posição de origem."
        );

        campoOrigem.focus();

        return;

    }


    if (destino === "") {

        alert(
            "Digite a posição de destino."
        );

        campoDestino.focus();

        return;

    }


    if (origem === destino) {

        alert(
            "A posição de origem e a posição de destino não podem ser iguais."
        );

        campoDestino.focus();

        return;

    }


    const estoque =
        carregarEstoque();


    const produtoOrigem =
        estoque.find(
            function (produto) {

                return (
                    normalizarCodigo(
                        produto.codigo
                    ) === codigo
                    &&
                    normalizarEndereco(
                        produto.endereco
                    ) === origem
                );

            }
        );


    if (!produtoOrigem) {

        alert(
            "Produto não encontrado na posição de origem.\n\n" +
            "Código: " +
            codigo +
            "\nOrigem: " +
            origem
        );

        return;

    }


    const quantidadeOrigem =
        converterNumero(
            produtoOrigem.quantidade
        );


    if (
        quantidadeTransferida >
        quantidadeOrigem
    ) {

        alert(
            "Saldo insuficiente na posição de origem.\n\n" +
            "Saldo disponível: " +
            formatarQuantidade(
                quantidadeOrigem
            )
        );

        return;

    }


    const valorTotalOrigem =
        converterNumero(
            produtoOrigem.valorTotal
        );


    const valorUnitario =
        quantidadeOrigem > 0
            ? valorTotalOrigem /
              quantidadeOrigem
            : 0;


    const valorTransferido =
        quantidadeTransferida *
        valorUnitario;


    produtoOrigem.quantidade =
        quantidadeOrigem -
        quantidadeTransferida;


    produtoOrigem.valorTotal =
        Math.max(
            0,
            valorTotalOrigem -
            valorTransferido
        );


    const produtoDestino =
        estoque.find(
            function (produto) {

                return (
                    normalizarCodigo(
                        produto.codigo
                    ) === codigo
                    &&
                    normalizarEndereco(
                        produto.endereco
                    ) === destino
                );

            }
        );


    if (produtoDestino) {

        produtoDestino.quantidade =
            converterNumero(
                produtoDestino.quantidade
            ) +
            quantidadeTransferida;


        produtoDestino.valorTotal =
            converterNumero(
                produtoDestino.valorTotal
            ) +
            valorTransferido;

    } else {

        estoque.push(
            {
                nf:
                    produtoOrigem.nf ||
                    "",

                codigo:
                    produtoOrigem.codigo ||
                    codigo,

                descricao:
                    produtoOrigem.descricao ||
                    "Sem descrição",

                cliente:
                    produtoOrigem.cliente ||
                    "SMI",

                quantidade:
                    quantidadeTransferida,

                valorTotal:
                    valorTransferido,

                endereco:
                    destino
            }
        );

    }


    const estoqueAtualizado =
        estoque.filter(
            function (produto) {

                return (
                    converterNumero(
                        produto.quantidade
                    ) > 0
                );

            }
        );


    const sincronizouBanco =
        await sincronizarTransferenciaProdutoSupabase(
            codigo,
            origem,
            destino,
            quantidadeTransferida
        );

    if (!sincronizouBanco) {
        return;
    }

    const salvou =
        salvarEstoque(
            estoqueAtualizado
        );


    if (!salvou) {

        return;

    }


    const movimentacao = {

        tipo:
            "TRANSFERENCIA",

        codigo:
            produtoOrigem.codigo ||
            codigo,

        descricao:
            produtoOrigem.descricao ||
            "Sem descrição",

        quantidade:
            quantidadeTransferida,

        valorTotal:
            valorTransferido,

        origem:
            origem,

        destino:
            destino,

        cliente:
            produtoOrigem.cliente ||
            "SMI",

        data:
            obterDataHoraAtual(),

        operador:
            obterNomeUsuario()

    };


    salvarHistoricoTransferencia(
        movimentacao
    );


    salvarMovimentacaoGeral(
        movimentacao
    );


    limparCamposTransferencia();


    carregarHistoricoTransferencias();


    alert(
        "Transferência registrada com sucesso!\n\n" +
        "Código: " +
        movimentacao.codigo +
        "\nQuantidade: " +
        formatarQuantidade(
            quantidadeTransferida
        ) +
        "\nOrigem: " +
        origem +
        "\nDestino: " +
        destino
    );


    campoCodigo.focus();

}


// =====================================================
// SALVAR HISTÓRICO DE TRANSFERÊNCIAS
// =====================================================

function salvarHistoricoTransferencia(
    movimentacao
) {

    const transferencias =
        carregarListaLocalStorage(
            "transferencias"
        );


    transferencias.unshift(
        movimentacao
    );


    salvarListaLocalStorage(
        "transferencias",
        transferencias
    );

}


// =====================================================
// CARREGAR HISTÓRICO DE TRANSFERÊNCIAS
// =====================================================

function carregarHistoricoTransferencias() {

    const tabela =
        document.getElementById(
            "listaTransferencias"
        );


    if (!tabela) {

        return;

    }


    const transferencias =
        carregarListaLocalStorage(
            "transferencias"
        );


    tabela.innerHTML = "";


    if (transferencias.length === 0) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='7' " +
                    "style='text-align:center;'" +
                ">" +
                    "Nenhuma transferência registrada." +
                "</td>" +
            "</tr>";

        return;

    }


    transferencias.forEach(
        function (transferencia) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.appendChild(
                criarCelula(
                    transferencia.codigo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    transferencia.descricao ||
                    "Sem descrição"
                )
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        transferencia.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    transferencia.origem ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    transferencia.destino ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    transferencia.data ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    transferencia.operador ||
                    "Administrador"
                )
            );


            tabela.appendChild(
                linha
            );

        }
    );

}


// =====================================================
// LIMPAR CAMPOS DA TRANSFERÊNCIA
// =====================================================

function limparCamposTransferencia() {

    const ids = [
        "codigoTransferencia",
        "quantidadeTransferencia",
        "origemTransferencia",
        "destinoTransferencia",
        "enderecoOrigem",
        "enderecoDestino"
    ];


    ids.forEach(
        function (id) {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.value = "";

            }

        }
    );

}


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.registrarTransferencia =
    registrarTransferencia;

window.salvarHistoricoTransferencia =
    salvarHistoricoTransferencia;

window.carregarHistoricoTransferencias =
    carregarHistoricoTransferencias;

window.carregarTransferencias =
    carregarHistoricoTransferencias;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 7 - MAPA DE POSIÇÕES
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE POSIÇÕES
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const mapa =
            document.getElementById(
                "mapaEstoque"
            );

        if (mapa) {

            carregarMapaEstoque();

        }

    }
);


// =====================================================
// CONFIGURAÇÃO DAS POSIÇÕES
// =====================================================

function gerarListaPosicoes() {

    const posicoes = [];

    const letras = [
        "A",
        "B",
        "C",
        "D"
    ];

    for (
        let numero = 1;
        numero <= 90;
        numero++
    ) {

        letras.forEach(
            function (letra) {

                posicoes.push(
                    String(numero) +
                    letra
                );

            }
        );

    }

    return posicoes;

}


// =====================================================
// CARREGAR MAPA DO ESTOQUE
// =====================================================

function carregarMapaEstoque() {

    const mapa =
        document.getElementById(
            "mapaEstoque"
        );


    if (!mapa) {

        return;

    }


    const estoque =
        carregarEstoque();


    const listaPosicoes =
        gerarListaPosicoes();


    mapa.innerHTML = "";


    listaPosicoes.forEach(
        function (posicao) {

            const produtosPosicao =
                estoque.filter(
                    function (produto) {

                        return (
                            normalizarEndereco(
                                produto.endereco
                            ) ===
                            normalizarEndereco(
                                posicao
                            )
                        );

                    }
                );


            const quantidadeTotal =
                produtosPosicao.reduce(
                    function (
                        total,
                        produto
                    ) {

                        return (
                            total +
                            converterNumero(
                                produto.quantidade
                            )
                        );

                    },
                    0
                );


            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "posicao-estoque";


            if (
                produtosPosicao.length > 0
            ) {

                botao.classList.add(
                    "ocupada"
                );

            } else {

                botao.classList.add(
                    "livre"
                );

            }


            const codigoPosicao =
                document.createElement(
                    "strong"
                );


            codigoPosicao.textContent =
                posicao;


            const informacao =
                document.createElement(
                    "span"
                );


            informacao.textContent =
                produtosPosicao.length > 0

                    ? produtosPosicao.length +
                      " item(ns)"

                    : "0 itens";


            const quantidade =
                document.createElement(
                    "small"
                );


            quantidade.textContent =
                produtosPosicao.length > 0

                    ? formatarQuantidade(
                        quantidadeTotal
                    ) +
                    " unidades"

                    : "Posição livre";


            botao.appendChild(
                codigoPosicao
            );


            botao.appendChild(
                informacao
            );


            botao.appendChild(
                quantidade
            );


            botao.addEventListener(
                "click",
                function () {

                    abrirModalPosicao(
                        posicao
                    );

                }
            );


            mapa.appendChild(
                botao
            );

        }
    );

}


// =====================================================
// ABRIR MODAL DA POSIÇÃO
// =====================================================

function abrirModalPosicao(
    posicao
) {

    const modal =
        document.getElementById(
            "modalPosicao"
        );


    const titulo =
        document.getElementById(
            "tituloPosicao"
        );


    const tabela =
        document.getElementById(
            "listaProdutosPosicao"
        );


    const totalSku =
        document.getElementById(
            "totalSku"
        );


    if (
        !modal ||
        !titulo ||
        !tabela
    ) {

        return;

    }


    const estoque =
        carregarEstoque();


    const produtosPosicao =
        estoque.filter(
            function (produto) {

                return (
                    normalizarEndereco(
                        produto.endereco
                    ) ===
                    normalizarEndereco(
                        posicao
                    )
                );

            }
        );


    titulo.textContent =
        "POSIÇÃO " +
        posicao;


    tabela.innerHTML = "";


    if (
        produtosPosicao.length === 0
    ) {

        const linha =
            document.createElement(
                "tr"
            );


        const celula =
            document.createElement(
                "td"
            );


        celula.colSpan =
            3;


        celula.style.textAlign =
            "center";


        celula.textContent =
            "Nenhum produto armazenado nesta posição.";


        linha.appendChild(
            celula
        );


        tabela.appendChild(
            linha
        );

    } else {

        produtosPosicao.forEach(
            function (produto) {

                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.appendChild(
                    criarCelula(
                        produto.codigo ||
                        "-"
                    )
                );


                linha.appendChild(
                    criarCelula(
                        produto.descricao ||
                        "Sem descrição"
                    )
                );


                linha.appendChild(
                    criarCelula(
                        formatarQuantidade(
                            produto.quantidade
                        )
                    )
                );


                tabela.appendChild(
                    linha
                );

            }
        );

    }


    if (totalSku) {

        totalSku.textContent =
            produtosPosicao.length;

    }


    modal.style.display =
        "flex";

}


// =====================================================
// FECHAR MODAL DA POSIÇÃO
// =====================================================

function fecharModalPosicao() {

    const modal =
        document.getElementById(
            "modalPosicao"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";

}


// =====================================================
// PESQUISAR POSIÇÃO
// =====================================================

function pesquisarPosicao() {

    const campo =
        document.getElementById(
            "pesquisaPosicao"
        );


    if (!campo) {

        return;

    }


    const pesquisa =
        normalizarEndereco(
            campo.value
        );


    const botoes =
        document.querySelectorAll(
            "#mapaEstoque .posicao-estoque"
        );


    botoes.forEach(
        function (botao) {

            const texto =
                normalizarEndereco(
                    botao.textContent
                );


            botao.style.display =
                pesquisa === "" ||
                texto.includes(
                    pesquisa
                )

                    ? ""

                    : "none";

        }
    );

}


// =====================================================
// FECHAR MODAL CLICANDO FORA
// =====================================================

window.addEventListener(
    "click",
    function (evento) {

        const modal =
            document.getElementById(
                "modalPosicao"
            );


        if (
            modal &&
            evento.target === modal
        ) {

            fecharModalPosicao();

        }

    }
);


// =====================================================
// ATUALIZAR MAPA QUANDO O ESTOQUE MUDAR
// =====================================================

window.addEventListener(
    "storage",
    function (evento) {

        if (
            evento.key ===
            "estoque"
        ) {

            carregarMapaEstoque();

        }

    }
);


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.carregarMapaEstoque =
    carregarMapaEstoque;

window.abrirModalPosicao =
    abrirModalPosicao;

window.fecharModalPosicao =
    fecharModalPosicao;

window.pesquisarPosicao =
    pesquisarPosicao;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 8 - DASHBOARD E MOVIMENTAÇÕES
// =====================================================


// =====================================================
// INICIALIZAÇÃO DO DASHBOARD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarResumoDashboard();

    }
);


// =====================================================
// ALTERAR TEXTO DE UM ELEMENTO COM SEGURANÇA
// =====================================================

function alterarTextoDashboard(
    id,
    texto
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


// =====================================================
// OBTER TODAS AS MOVIMENTAÇÕES
// =====================================================

function obterTodasMovimentacoes() {

    const movimentacoesGerais =
        carregarListaLocalStorage(
            "movimentacoes"
        );


    const entradas =
        carregarListaLocalStorage(
            "entradas"
        )
        .map(
            function (movimentacao) {

                return prepararMovimentacao(
                    movimentacao,
                    "ENTRADA"
                );

            }
        );


    const saidas =
        carregarListaLocalStorage(
            "saidas"
        )
        .map(
            function (movimentacao) {

                return prepararMovimentacao(
                    movimentacao,
                    "SAIDA"
                );

            }
        );


    const transferencias =
        carregarListaLocalStorage(
            "transferencias"
        )
        .map(
            function (movimentacao) {

                return prepararMovimentacao(
                    movimentacao,
                    "TRANSFERENCIA"
                );

            }
        );


    const todas = [

        ...movimentacoesGerais.map(
            function (movimentacao) {

                return prepararMovimentacao(
                    movimentacao,
                    movimentacao.tipo || ""
                );

            }
        ),

        ...entradas,

        ...saidas,

        ...transferencias

    ];


    return removerMovimentacoesDuplicadas(
        todas
    );

}


// =====================================================
// PREPARAR MOVIMENTAÇÃO
// =====================================================

function prepararMovimentacao(
    movimentacao,
    tipoPadrao
) {

    const registro =

        movimentacao &&
        typeof movimentacao ===
        "object"

            ? {
                ...movimentacao
            }

            : {};


    registro.tipo =
        normalizarTipoMovimentacaoApp(
            registro.tipo ||
            tipoPadrao
        );


    registro.codigo =
        registro.codigo ||
        registro.sku ||
        registro.produto ||
        "";


    registro.descricao =
        registro.descricao ||
        registro.nomeProduto ||
        "Sem descrição";


    registro.quantidade =
        converterNumero(
            registro.quantidade ??
            registro.qtd ??
            registro.qtde ??
            0
        );


    registro.valorTotal =
        converterNumero(
            registro.valorTotal ??
            0
        );


    registro.data =
        registro.data ||
        registro.dataHora ||
        registro.horario ||
        registro.criadoEm ||
        "";


    registro.operador =
        registro.operador ||
        registro.usuario ||
        registro.responsavel ||
        obterNomeUsuario();


    if (
        registro.tipo ===
        "ENTRADA"
    ) {

        registro.origem =
            registro.origem ||
            "Recebimento";


        registro.destino =
            registro.destino ||
            registro.endereco ||
            "-";

    }


    if (
        registro.tipo ===
        "SAIDA"
    ) {

        registro.origem =
            registro.origem ||
            registro.endereco ||
            "-";


        registro.destino =
            registro.destino ||
            "Expedição";

    }


    if (
        registro.tipo ===
        "TRANSFERENCIA"
    ) {

        registro.origem =
            registro.origem ||
            registro.enderecoOrigem ||
            "-";


        registro.destino =
            registro.destino ||
            registro.enderecoDestino ||
            "-";

    }


    return registro;

}


// =====================================================
// NORMALIZAR TIPO DA MOVIMENTAÇÃO
// =====================================================

function normalizarTipoMovimentacaoApp(
    tipo
) {

    const texto =
        String(
            tipo || ""
        )
        .trim()
        .toUpperCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );


    if (
        texto.includes(
            "ENTRADA"
        )
    ) {

        return "ENTRADA";

    }


    if (
        texto.includes(
            "SAIDA"
        )
    ) {

        return "SAIDA";

    }


    if (
        texto.includes(
            "TRANSFERENCIA"
        ) ||
        texto.includes(
            "TRANSFERIR"
        )
    ) {

        return "TRANSFERENCIA";

    }


    return (
        texto ||
        "MOVIMENTACAO"
    );

}


// =====================================================
// REMOVER MOVIMENTAÇÕES DUPLICADAS
// =====================================================

function removerMovimentacoesDuplicadas(
    movimentacoes
) {

    const registrosUnicos = [];

    const assinaturas =
        new Set();


    movimentacoes.forEach(
        function (movimentacao) {

            const assinatura = [

                normalizarTipoMovimentacaoApp(
                    movimentacao.tipo
                ),

                normalizarCodigo(
                    movimentacao.codigo
                ),

                converterNumero(
                    movimentacao.quantidade
                ),

                String(
                    movimentacao.data || ""
                ).trim(),

                normalizarEndereco(
                    movimentacao.origem ||
                    movimentacao.endereco
                ),

                normalizarEndereco(
                    movimentacao.destino
                )

            ].join("|");


            if (
                assinaturas.has(
                    assinatura
                )
            ) {

                return;

            }


            assinaturas.add(
                assinatura
            );


            registrosUnicos.push(
                movimentacao
            );

        }
    );


    return registrosUnicos;

}


// =====================================================
// ATUALIZAR RESUMO DO DASHBOARD
// =====================================================

function atualizarResumoDashboard() {

    const estoque =
        carregarEstoque();


    const codigosUnicos =
        new Set();


    const posicoesUnicas =
        new Set();


    let quantidadeTotal =
        0;


    let valorTotalEstoque =
        0;


    estoque.forEach(
        function (produto) {

            const codigo =
                normalizarCodigo(
                    produto.codigo
                );


            const endereco =
                normalizarEndereco(
                    produto.endereco
                );


            if (codigo) {

                codigosUnicos.add(
                    codigo
                );

            }


            if (endereco) {

                posicoesUnicas.add(
                    endereco
                );

            }


            quantidadeTotal +=
                converterNumero(
                    produto.quantidade
                );


            /*
              Aqui o Dashboard soma diretamente
              a coluna VALOR TOTAL importada do Excel.
            */

            valorTotalEstoque +=
                converterNumero(
                    produto.valorTotal
                );

        }
    );


    const totalProdutos =
        codigosUnicos.size;


    const totalPosicoes =
        posicoesUnicas.size;


    const totalPosicoesArmazem =
        360;


    const percentualOcupacao =
        totalPosicoesArmazem > 0

            ? Math.min(
                100,
                (
                    totalPosicoes /
                    totalPosicoesArmazem
                ) * 100
            )

            : 0;


    // Dashboard atual

    alterarTextoDashboard(
        "cardProdutos",
        totalProdutos.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "cardQuantidade",
        quantidadeTotal.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "cardValor",
        valorTotalEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
    );


    alterarTextoDashboard(
        "cardPosicoes",
        totalPosicoes.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "cardNiveis",
        percentualOcupacao.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }
        ) + "%"
    );


    // Compatibilidade com IDs antigos

    alterarTextoDashboard(
        "totalProdutos",
        totalProdutos.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "totalItens",
        quantidadeTotal.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "posicoesOcupadas",
        totalPosicoes.toLocaleString(
            "pt-BR"
        )
    );


    alterarTextoDashboard(
        "valorEstoque",
        valorTotalEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
    );


    alterarTextoDashboard(
        "totalValorEstoque",
        valorTotalEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
    );


    atualizarBarrasOcupacao(
        percentualOcupacao
    );


    atualizarResumoMovimentacoes();


    carregarUltimasMovimentacoes();

}


// =====================================================
// ATUALIZAR BARRAS DE OCUPAÇÃO
// =====================================================

function atualizarBarrasOcupacao(
    percentual
) {

    const progressoPosicoes =
        document.getElementById(
            "progressoPosicoes"
        );


    const progressoNiveis =
        document.getElementById(
            "progressoNiveis"
        );


    const largura =
        Math.max(
            0,
            Math.min(
                100,
                converterNumero(
                    percentual
                )
            )
        ) + "%";


    if (progressoPosicoes) {

        progressoPosicoes.style.width =
            largura;

    }


    if (progressoNiveis) {

        progressoNiveis.style.width =
            largura;

    }

}


// =====================================================
// RESUMO DAS MOVIMENTAÇÕES
// =====================================================

function atualizarResumoMovimentacoes() {

    const movimentacoes =
        obterTodasMovimentacoes();

    const agora = new Date();

    const hoje =
        String(agora.getDate()).padStart(2, "0") +
        "/" +
        String(agora.getMonth() + 1).padStart(2, "0") +
        "/" +
        agora.getFullYear();

    let totalEntradas = 0;
    let totalSaidas = 0;
    let totalTransferencias = 0;

    movimentacoes.forEach(function (movimentacao) {

        const textoData =
            String(movimentacao.data || "").trim();

        const dataMovimentacao =
            textoData.match(
                /^(\d{1,2}\/\d{1,2}\/\d{4})/
            );

        if (
            !dataMovimentacao ||
            dataMovimentacao[1] !== hoje
        ) {
            return;
        }

        const tipo =
            normalizarTipoMovimentacaoApp(
                movimentacao.tipo
            );

        const quantidade =
            converterNumero(
                movimentacao.quantidade
            );

        if (tipo === "ENTRADA") {
            totalEntradas += quantidade;
        }

        if (tipo === "SAIDA") {
            totalSaidas += quantidade;
        }

        if (tipo === "TRANSFERENCIA") {
            totalTransferencias +=
                quantidade > 0
                    ? quantidade
                    : 1;
        }
    });

    const saldo =
        totalEntradas - totalSaidas;

    alterarTextoDashboard(
        "resumoEntradas",
        formatarQuantidade(totalEntradas)
    );

    alterarTextoDashboard(
        "resumoSaidas",
        formatarQuantidade(totalSaidas)
    );

    alterarTextoDashboard(
        "resumoTransferencias",
        formatarQuantidade(totalTransferencias)
    );

    alterarTextoDashboard(
        "resumoSaldo",
        formatarQuantidade(saldo)
    );
}

// =====================================================
// CARREGAR ÚLTIMAS MOVIMENTAÇÕES
// =====================================================

function carregarUltimasMovimentacoes() {

    const tabela =
        document.getElementById(
            "ultimasMovimentacoes"
        );


    if (!tabela) {

        return;

    }


    const movimentacoes =
        obterTodasMovimentacoes()
            .sort(
                function (a, b) {

                    const dataA =
                        converterDataMovimentacao(
                            a.data
                        );


                    const dataB =
                        converterDataMovimentacao(
                            b.data
                        );


                    return (
                        dataB -
                        dataA
                    );

                }
            )
            .slice(
                0,
                10
            );


    tabela.innerHTML =
        "";


    if (
        movimentacoes.length === 0
    ) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='8' " +
                    "class='dashboard-sem-registro'" +
                ">" +
                    "Nenhuma movimentação registrada." +
                "</td>" +
            "</tr>";

        return;

    }


    movimentacoes.forEach(
        function (movimentacao) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.appendChild(
                criarCelula(
                    movimentacao.tipo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.codigo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.descricao ||
                    "Sem descrição"
                )
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        movimentacao.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.origem ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.destino ||
                    movimentacao.endereco ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.data ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.operador ||
                    "Administrador"
                )
            );


            tabela.appendChild(
                linha
            );

        }
    );

}


// =====================================================
// CONVERTER DATA DA MOVIMENTAÇÃO
// =====================================================

function converterDataMovimentacao(
    valor
) {

    if (!valor) {

        return new Date(0);

    }


    const texto =
        String(
            valor
        ).trim();


    const partes =
        texto.match(
            /(\d{2})\/(\d{2})\/(\d{4})(?:,\s*|\s+)?(\d{2}):(\d{2})(?::(\d{2}))?/
        );


    if (partes) {

        return new Date(
            Number(partes[3]),
            Number(partes[2]) - 1,
            Number(partes[1]),
            Number(partes[4]),
            Number(partes[5]),
            Number(partes[6] || 0)
        );

    }


    const data =
        new Date(
            texto
        );


    return Number.isNaN(
        data.getTime()
    )

        ? new Date(0)

        : data;

}


// =====================================================
// COMPATIBILIDADE COM NOMES ANTIGOS
// =====================================================

function carregarDashboard() {

    atualizarResumoDashboard();

}


function atualizarResumoDashboardAntigo() {

    atualizarResumoDashboard();

}


// =====================================================
// AVISAR OUTRAS TELAS SOBRE ALTERAÇÕES
// =====================================================

function dispararAtualizacaoWMS(
    tipo
) {

    try {

        localStorage.setItem(
            "ultimaAtualizacaoWMS",
            JSON.stringify(
                {
                    tipo:
                        tipo ||
                        "ATUALIZACAO",

                    data:
                        new Date()
                            .toISOString()
                }
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao registrar atualização do WMS:",
            erro
        );

    }

}


// =====================================================
// ATUALIZAÇÃO ENTRE ABAS
// =====================================================

window.addEventListener(
    "storage",
    function (evento) {

        const chavesImportantes = [
            "estoque",
            "movimentacoes",
            "entradas",
            "saidas",
            "transferencias",
            "ultimaAtualizacaoWMS"
        ];


        if (
            !chavesImportantes.includes(
                evento.key
            )
        ) {

            return;

        }


        atualizarResumoDashboard();


        if (
            typeof carregarTabelaProdutos ===
            "function"
        ) {

            carregarTabelaProdutos();

        }


        if (
            typeof carregarMapaEstoque ===
            "function"
        ) {

            carregarMapaEstoque();

        }

    }
);


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.obterTodasMovimentacoes =
    obterTodasMovimentacoes;

window.prepararMovimentacao =
    prepararMovimentacao;

window.normalizarTipoMovimentacaoApp =
    normalizarTipoMovimentacaoApp;

window.removerMovimentacoesDuplicadas =
    removerMovimentacoesDuplicadas;

window.atualizarResumoDashboard =
    atualizarResumoDashboard;

window.atualizarResumoDashboardAntigo =
    atualizarResumoDashboardAntigo;

window.carregarDashboard =
    carregarDashboard;

window.carregarUltimasMovimentacoes =
    carregarUltimasMovimentacoes;

window.dispararAtualizacaoWMS =
    dispararAtualizacaoWMS;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 9 - RELATÓRIOS
// =====================================================


// =====================================================
// INICIALIZAÇÃO DA PÁGINA DE RELATÓRIOS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tabelaRelatorios =
            document.getElementById(
                "listaRelatorios"
            );


        if (tabelaRelatorios) {

            carregarRelatorios();

        }

    }
);


// =====================================================
// CARREGAR RELATÓRIOS
// =====================================================

function carregarRelatorios() {

    carregarResumoRelatorios();

    carregarTabelaRelatorios();

}


// =====================================================
// CARREGAR RESUMO DO ESTOQUE
// =====================================================

function carregarResumoRelatorios() {

    const estoque =
        carregarEstoque();


    const codigosUnicos =
        new Set();


    const posicoesUnicas =
        new Set();


    let quantidadeTotal =
        0;


    let valorTotalEstoque =
        0;


    estoque.forEach(
        function (produto) {

            const codigo =
                normalizarCodigo(
                    produto.codigo
                );


            const endereco =
                normalizarEndereco(
                    produto.endereco
                );


            if (codigo) {

                codigosUnicos.add(
                    codigo
                );

            }


            if (endereco) {

                posicoesUnicas.add(
                    endereco
                );

            }


            quantidadeTotal +=
                converterNumero(
                    produto.quantidade
                );


            valorTotalEstoque +=
                converterNumero(
                    produto.valorTotal
                );

        }
    );


    atualizarElementoRelatorio(
        "relProdutos",
        codigosUnicos.size.toLocaleString(
            "pt-BR"
        )
    );


    atualizarElementoRelatorio(
        "relQuantidade",
        quantidadeTotal.toLocaleString(
            "pt-BR"
        )
    );


    atualizarElementoRelatorio(
        "relValor",
        valorTotalEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
    );


    atualizarElementoRelatorio(
        "relPosicoes",
        posicoesUnicas.size.toLocaleString(
            "pt-BR"
        )
    );

}


// =====================================================
// ATUALIZAR ELEMENTO DO RELATÓRIO
// =====================================================

function atualizarElementoRelatorio(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


// =====================================================
// CARREGAR TABELA DE RELATÓRIOS
// =====================================================

function carregarTabelaRelatorios() {

    const tabela =
        document.getElementById(
            "listaRelatorios"
        );


    if (!tabela) {

        return;

    }


    const movimentacoes =
        obterTodasMovimentacoes()
            .sort(
                function (a, b) {

                    return (
                        converterDataMovimentacao(
                            b.data
                        ) -
                        converterDataMovimentacao(
                            a.data
                        )
                    );

                }
            );


    tabela.innerHTML =
        "";


    if (
        movimentacoes.length === 0
    ) {

        tabela.innerHTML =
            "<tr>" +
                "<td " +
                    "colspan='8' " +
                    "style='text-align:center;'" +
                ">" +
                    "Nenhuma movimentação registrada." +
                "</td>" +
            "</tr>";

        return;

    }


    movimentacoes.forEach(
        function (movimentacao) {

            const linha =
                document.createElement(
                    "tr"
                );


            const tipo =
                normalizarTipoMovimentacaoApp(
                    movimentacao.tipo
                );


            linha.dataset.tipo =
                tipo;


            linha.appendChild(
                criarCelula(
                    formatarTipoRelatorio(
                        tipo
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.codigo ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.descricao ||
                    "Sem descrição"
                )
            );


            linha.appendChild(
                criarCelula(
                    formatarQuantidade(
                        movimentacao.quantidade
                    )
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.origem ||
                    movimentacao.endereco ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.destino ||
                    movimentacao.endereco ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.data ||
                    "-"
                )
            );


            linha.appendChild(
                criarCelula(
                    movimentacao.operador ||
                    movimentacao.usuario ||
                    "Administrador"
                )
            );


            tabela.appendChild(
                linha
            );

        }
    );


    filtrarRelatorio();

}


// =====================================================
// FORMATAR TIPO DA MOVIMENTAÇÃO
// =====================================================

function formatarTipoRelatorio(
    tipo
) {

    if (tipo === "ENTRADA") {

        return "ENTRADA";

    }


    if (tipo === "SAIDA") {

        return "SAÍDA";

    }


    if (
        tipo ===
        "TRANSFERENCIA"
    ) {

        return "TRANSFERÊNCIA";

    }


    return tipo || "MOVIMENTAÇÃO";

}


// =====================================================
// FILTRAR RELATÓRIO
// =====================================================

function filtrarRelatorio() {

    const campoFiltro =
        document.getElementById(
            "filtroMovimento"
        ) ||
        document.getElementById(
            "filtroTipo"
        );


    const filtro =
        campoFiltro

            ? normalizarTipoMovimentacaoApp(
                campoFiltro.value
            )

            : "TODOS";


    const linhas =
        document.querySelectorAll(
            "#listaRelatorios tr"
        );


    linhas.forEach(
        function (linha) {

            if (
                linha.children.length < 2
            ) {

                return;

            }


            const tipoLinha =
                normalizarTipoMovimentacaoApp(
                    linha.dataset.tipo ||
                    linha.children[0]
                        .textContent
                );


            const mostrar =
                !campoFiltro ||
                campoFiltro.value === "" ||
                campoFiltro.value === "TODOS" ||
                filtro === "MOVIMENTACAO" ||
                tipoLinha === filtro;


            linha.style.display =
                mostrar
                    ? ""
                    : "none";

        }
    );

}


// =====================================================
// IMPRIMIR RELATÓRIO
// =====================================================

function imprimirRelatorio() {

    window.print();

}


// =====================================================
// OBTER LINHAS VISÍVEIS DO RELATÓRIO
// =====================================================

function obterDadosRelatorioVisiveis() {

    const linhas =
        Array.from(
            document.querySelectorAll(
                "#listaRelatorios tr"
            )
        );


    const dados = [];


    linhas.forEach(
        function (linha) {

            if (
                linha.style.display ===
                "none"
            ) {

                return;

            }


            const colunas =
                linha.querySelectorAll(
                    "td"
                );


            if (
                colunas.length < 8
            ) {

                return;

            }


            dados.push(
                {
                    Tipo:
                        colunas[0]
                            .textContent
                            .trim(),

                    Código:
                        colunas[1]
                            .textContent
                            .trim(),

                    Descrição:
                        colunas[2]
                            .textContent
                            .trim(),

                    Quantidade:
                        colunas[3]
                            .textContent
                            .trim(),

                    Origem:
                        colunas[4]
                            .textContent
                            .trim(),

                    Destino:
                        colunas[5]
                            .textContent
                            .trim(),

                    Data:
                        colunas[6]
                            .textContent
                            .trim(),

                    Operador:
                        colunas[7]
                            .textContent
                            .trim()
                }
            );

        }
    );


    return dados;

}


// =====================================================
// EXPORTAR RELATÓRIO PARA EXCEL
// =====================================================

function exportarRelatorioExcel() {

    const dados =
        obterDadosRelatorioVisiveis();


    if (
        dados.length === 0
    ) {

        alert(
            "Não existem registros visíveis para exportar."
        );

        return;

    }


    if (
        typeof XLSX !==
        "undefined"
    ) {

        const planilha =
            XLSX.utils.json_to_sheet(
                dados
            );


        planilha["!cols"] = [
            { wch: 18 },
            { wch: 18 },
            { wch: 45 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 22 },
            { wch: 22 }
        ];


        const pastaExcel =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            pastaExcel,
            planilha,
            "Movimentações"
        );


        XLSX.writeFile(
            pastaExcel,
            "relatorio_movimentacoes_smi.xlsx"
        );


        return;

    }


    exportarRelatorioCSV(
        dados
    );

}


// =====================================================
// EXPORTAÇÃO ALTERNATIVA EM CSV
// =====================================================

function exportarRelatorioCSV(
    dadosRecebidos
) {

    const dados =
        Array.isArray(
            dadosRecebidos
        )

            ? dadosRecebidos

            : obterDadosRelatorioVisiveis();


    if (
        dados.length === 0
    ) {

        alert(
            "Não existem registros para exportar."
        );

        return;

    }


    const cabecalhos = [
        "Tipo",
        "Código",
        "Descrição",
        "Quantidade",
        "Origem",
        "Destino",
        "Data",
        "Operador"
    ];


    const linhasCSV = [
        cabecalhos.join(";")
    ];


    dados.forEach(
        function (registro) {

            const linha = [
                registro.Tipo,
                registro.Código,
                registro.Descrição,
                registro.Quantidade,
                registro.Origem,
                registro.Destino,
                registro.Data,
                registro.Operador
            ]
            .map(
                function (valor) {

                    return (
                        '"' +
                        String(
                            valor || ""
                        )
                        .replace(
                            /"/g,
                            '""'
                        ) +
                        '"'
                    );

                }
            )
            .join(";");


            linhasCSV.push(
                linha
            );

        }
    );


    const conteudo =
        "\uFEFF" +
        linhasCSV.join(
            "\n"
        );


    const arquivo =
        new Blob(
            [
                conteudo
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        URL.createObjectURL(
            arquivo
        );


    link.download =
        "relatorio_movimentacoes_smi.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        link.href
    );

}


// =====================================================
// EXPORTAR ESTOQUE COMPLETO PARA EXCEL
// =====================================================

function exportarEstoqueExcel() {

    const estoque =
        carregarEstoque();


    if (
        estoque.length === 0
    ) {

        alert(
            "Não existem produtos no estoque para exportar."
        );

        return;

    }


    const dados =
        estoque.map(
            function (produto) {

                return {

                    NF:
                        produto.nf ||
                        "",

                    Código:
                        produto.codigo ||
                        "",

                    Descrição:
                        produto.descricao ||
                        "",

                    Cliente:
                        produto.cliente ||
                        "SMI",

                    Quantidade:
                        converterNumero(
                            produto.quantidade
                        ),

                    "Valor Total":
                        converterNumero(
                            produto.valorTotal
                        ),

                    Posição:
                        produto.endereco ||
                        ""

                };

            }
        );


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca XLSX não foi carregada."
        );

        return;

    }


    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );


    planilha["!cols"] = [
        { wch: 16 },
        { wch: 18 },
        { wch: 50 },
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 }
    ];


    const pastaExcel =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        pastaExcel,
        planilha,
        "Estoque"
    );


    XLSX.writeFile(
        pastaExcel,
        "estoque_smi_wms.xlsx"
    );

}


// =====================================================
// ATUALIZAÇÃO ENTRE ABAS
// =====================================================

window.addEventListener(
    "storage",
    function (evento) {

        const chavesRelatorio = [
            "estoque",
            "movimentacoes",
            "entradas",
            "saidas",
            "transferencias"
        ];


        if (
            chavesRelatorio.includes(
                evento.key
            )
        ) {

            carregarRelatorios();

        }

    }
);


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL
// =====================================================

window.carregarRelatorios =
    carregarRelatorios;

window.carregarTabelaRelatorios =
    carregarTabelaRelatorios;

window.filtrarRelatorio =
    filtrarRelatorio;

window.filtrarRelatorios =
    filtrarRelatorio;

window.imprimirRelatorio =
    imprimirRelatorio;

window.exportarRelatorioExcel =
    exportarRelatorioExcel;

window.exportarRelatorioCSV =
    exportarRelatorioCSV;

window.exportarEstoqueExcel =
    exportarEstoqueExcel;
    // =====================================================
// SMI WMS - APP.JS
// PARTE 10 - COMPATIBILIDADE E FINALIZAÇÃO
// =====================================================


// =====================================================
// ATUALIZAR A TELA ATUAL
// =====================================================

function atualizarTelaAtual() {

    if (
        document.getElementById(
            "listaProdutos"
        ) &&
        typeof carregarTabelaProdutos ===
        "function"
    ) {

        carregarTabelaProdutos();

    }


    if (
        document.getElementById(
            "listaEntradas"
        ) &&
        typeof carregarHistoricoEntradas ===
        "function"
    ) {

        carregarHistoricoEntradas();

    }


    if (
        document.getElementById(
            "listaSaidas"
        ) &&
        typeof carregarHistoricoSaidas ===
        "function"
    ) {

        carregarHistoricoSaidas();

    }


    if (
        document.getElementById(
            "listaTransferencias"
        ) &&
        typeof carregarHistoricoTransferencias ===
        "function"
    ) {

        carregarHistoricoTransferencias();

    }


    if (
        document.getElementById(
            "mapaEstoque"
        ) &&
        typeof carregarMapaEstoque ===
        "function"
    ) {

        carregarMapaEstoque();

    }


    if (
        document.getElementById(
            "listaRelatorios"
        ) &&
        typeof carregarRelatorios ===
        "function"
    ) {

        carregarRelatorios();

    }


    if (
        typeof atualizarResumoDashboard ===
        "function"
    ) {

        atualizarResumoDashboard();

    }


    if (
        typeof atualizarDashboardCompleto ===
        "function"
    ) {

        atualizarDashboardCompleto();

    }

}


// =====================================================
// INICIALIZAÇÃO FINAL
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                atualizarTelaAtual();

                validarEstruturaPaginaAtual();

            },
            150
        );

    }
);


// =====================================================
// VALIDAR ESTRUTURA DA PÁGINA ATUAL
// =====================================================

function validarEstruturaPaginaAtual() {

    const pagina =
        String(
            window.location.pathname || ""
        )
        .split("/")
        .pop()
        .toLowerCase();


    if (
        pagina ===
        "produtos.html"
    ) {

        validarElementoWMS(
            "arquivoExcel",
            "Campo de seleção do Excel"
        );


        validarElementoWMS(
            "listaProdutos",
            "Tabela de produtos"
        );

    }


    if (
        pagina ===
        "entradas.html"
    ) {

        validarElementoWMS(
            "codigoEntrada",
            "Código da entrada"
        );


        validarElementoWMS(
            "quantidadeEntrada",
            "Quantidade da entrada"
        );


        validarElementoWMS(
            "enderecoEntrada",
            "Endereço da entrada"
        );


        validarElementoWMS(
            "listaEntradas",
            "Histórico de entradas"
        );

    }


    if (
        pagina ===
        "saidas.html"
    ) {

        validarElementoWMS(
            "codigoSaida",
            "Código da saída"
        );


        validarElementoWMS(
            "quantidadeSaida",
            "Quantidade da saída"
        );


        validarElementoWMS(
            "listaSaidas",
            "Histórico de saídas"
        );

    }


    if (
        pagina ===
        "transferencias.html"
    ) {

        validarElementoWMS(
            "codigoTransferencia",
            "Código da transferência"
        );


        validarElementoAlternativoWMS(
            [
                "origemTransferencia",
                "enderecoOrigem"
            ],
            "Endereço de origem"
        );


        validarElementoAlternativoWMS(
            [
                "destinoTransferencia",
                "enderecoDestino"
            ],
            "Endereço de destino"
        );

    }


    if (
        pagina ===
        "posicoes.html"
    ) {

        validarElementoWMS(
            "mapaEstoque",
            "Mapa de posições"
        );


        validarElementoWMS(
            "modalPosicao",
            "Modal da posição"
        );


        validarElementoWMS(
            "listaProdutosPosicao",
            "Tabela do modal da posição"
        );

    }


    if (
        pagina ===
        "relatorios.html"
    ) {

        validarElementoWMS(
            "listaRelatorios",
            "Tabela de relatórios"
        );

    }

}


// =====================================================
// VALIDAR UM ELEMENTO
// =====================================================

function validarElementoWMS(
    id,
    descricao
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        console.warn(
            "SMI WMS: " +
            descricao +
            ' não encontrado. ID esperado: "' +
            id +
            '".'
        );


        return false;

    }


    return true;

}


// =====================================================
// VALIDAR ELEMENTOS COM IDS ALTERNATIVOS
// =====================================================

function validarElementoAlternativoWMS(
    ids,
    descricao
) {

    const encontrado =
        ids.some(
            function (id) {

                return Boolean(
                    document.getElementById(
                        id
                    )
                );

            }
        );


    if (!encontrado) {

        console.warn(
            "SMI WMS: " +
            descricao +
            " não encontrado. IDs esperados: " +
            ids.join(", ") +
            "."
        );

    }


    return encontrado;

}


// =====================================================
// COMPATIBILIDADE COM NOMES ANTIGOS
// =====================================================

function carregarProdutos() {

    if (
        typeof carregarTabelaProdutos ===
        "function"
    ) {

        carregarTabelaProdutos();

    }

}


function carregarEntradas() {

    if (
        typeof carregarHistoricoEntradas ===
        "function"
    ) {

        carregarHistoricoEntradas();

    }

}


function carregarSaidas() {

    if (
        typeof carregarHistoricoSaidas ===
        "function"
    ) {

        carregarHistoricoSaidas();

    }

}


function carregarTransferencias() {

    if (
        typeof carregarHistoricoTransferencias ===
        "function"
    ) {

        carregarHistoricoTransferencias();

    }

}


function carregarPosicoes() {

    if (
        typeof carregarMapaEstoque ===
        "function"
    ) {

        carregarMapaEstoque();

    }

}


function receberMercadoria() {

    if (
        typeof registrarEntrada ===
        "function"
    ) {

        registrarEntrada();

    }

}


function registrarNovaSaida() {

    if (
        typeof registrarSaida ===
        "function"
    ) {

        registrarSaida();

    }

}


function movimentarProduto() {

    if (
        typeof registrarTransferencia ===
        "function"
    ) {

        registrarTransferencia();

    }

}


// =====================================================
// ATUALIZAR O SISTEMA APÓS MOVIMENTAÇÃO
// =====================================================

function atualizarSistemaDepoisDeMovimentacao(
    tipo
) {

    if (
        typeof dispararAtualizacaoWMS ===
        "function"
    ) {

        dispararAtualizacaoWMS(
            tipo
        );

    }


    atualizarTelaAtual();

}


// =====================================================
// EVENTO PERSONALIZADO DO WMS
// =====================================================

window.addEventListener(
    "smi-wms-atualizar",
    function () {

        atualizarTelaAtual();

    }
);


// =====================================================
// ATUALIZAR QUANDO A ABA FICAR VISÍVEL
// =====================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            atualizarTelaAtual();

        }

    }
);


// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

window.addEventListener(
    "error",
    function (evento) {

        console.error(
            "Erro no SMI WMS:",
            evento.message,
            evento.filename,
            evento.lineno
        );

    }
);


window.addEventListener(
    "unhandledrejection",
    function (evento) {

        console.error(
            "Erro não tratado no SMI WMS:",
            evento.reason
        );

    }
);


// =====================================================
// DISPONIBILIZAÇÃO GLOBAL FINAL
// =====================================================

window.atualizarTelaAtual =
    atualizarTelaAtual;

window.validarEstruturaPaginaAtual =
    validarEstruturaPaginaAtual;

window.carregarProdutos =
    carregarProdutos;

window.carregarEntradas =
    carregarEntradas;

window.carregarSaidas =
    carregarSaidas;

window.carregarTransferencias =
    carregarTransferencias;

window.carregarPosicoes =
    carregarPosicoes;

window.receberMercadoria =
    receberMercadoria;

window.registrarNovaSaida =
    registrarNovaSaida;

window.movimentarProduto =
    movimentarProduto;

window.atualizarSistemaDepoisDeMovimentacao =
    atualizarSistemaDepoisDeMovimentacao;


// =====================================================
// FIM DO APP.JS
// =====================================================

console.log(
    "SMI WMS: app.js carregado com sucesso."
);
// =====================================================
// FILTRO DE CLIENTES
// =====================================================

function carregarFiltroClientesProdutos() {

    const filtro =
        document.getElementById(
            "filtroClienteProdutos"
        );

    if (!filtro) {

        return;

    }

    const estoque =
        carregarEstoque();

    const clientes =
        [...new Set(

            estoque.map(function(produto){

                return produto.cliente || "SMI";

            })

        )];

    filtro.innerHTML =
        '<option value="">Todos os clientes</option>';

    clientes.sort().forEach(function(cliente){

        const option =
            document.createElement("option");

        option.value =
            cliente;

        option.textContent =
            cliente;

        filtro.appendChild(option);

    });

}
// =====================================================
// FILTRAR PRODUTOS POR CLIENTE
// =====================================================

function filtrarProdutosAvancado() {

    const clienteSelecionado =
        document.getElementById(
            "filtroClienteProdutos"
        ).value;

    const linhas =
        document.querySelectorAll(
            "#listaProdutos tr"
        );

    linhas.forEach(function(linha){

        const colunas =
            linha.querySelectorAll("td");

        if (colunas.length === 0) {

            return;

        }

        const cliente =
            colunas[3].textContent.trim();

        if (
            clienteSelecionado === "" ||
            cliente === clienteSelecionado
        ) {

            linha.style.display = "";

        } else {

            linha.style.display = "none";

        }

    });

}


// Compatibilidade das páginas antigas
function login() { return realizarLogin(); }
function verificarLogin() {
    const paginaLogin = /(^|\/)index\.html$/i.test(window.location.pathname) || window.location.pathname.endsWith('/');
    if (paginaLogin) return true;
    const usuario = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');
    if (!usuario) window.location.href = 'index.html';
    return Boolean(usuario);
}
window.login = login;
window.verificarLogin = verificarLogin;

window.atualizarResumoMovimentacoes =
    atualizarResumoMovimentacoes;
