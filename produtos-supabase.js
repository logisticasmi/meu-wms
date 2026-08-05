// =====================================================
// SMI WMS - PRODUTOS 100% INTEGRADOS AO SUPABASE
// =====================================================

const NOME_TABELA_PRODUTOS = "produtos";


// =====================================================
// CONEXÃO
// =====================================================

function verificarConexaoSupabase() {
    if (!window.supabaseClient) {
        console.error("Cliente Supabase não encontrado.");

        alert(
            "Não foi possível conectar ao banco de dados.\n\n" +
            "Verifique o arquivo supabase.js."
        );

        return false;
    }

    return true;
}


// =====================================================
// CONVERSÃO DOS DADOS
// =====================================================

function converterNumeroProduto(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return 0;
    }

    let texto = String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/R\$/gi, "");

    if (texto.includes(".") && texto.includes(",")) {
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    texto = texto.replace(/[^0-9.-]/g, "");

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : 0;
}


function normalizarProdutoBanco(produto) {
    return {
        ...produto,

        nf: produto.nf || "",

        codigo: produto.codigo || "",

        descricao: produto.descricao || "",

        cliente: produto.cliente || "SMI",

        quantidade: converterNumeroProduto(
            produto.quantidade
        ),

        valorTotal: converterNumeroProduto(
            produto.valor_total ??
            produto.valorTotal ??
            0
        ),

        endereco: produto.endereco || ""
    };
}


function prepararProdutoParaBanco(produto) {
    return {
        nf: String(produto.nf || "").trim(),

        codigo: String(produto.codigo || "").trim(),

        descricao: String(
            produto.descricao || ""
        ).trim(),

        cliente: String(
            produto.cliente || "SMI"
        ).trim() || "SMI",

        quantidade: converterNumeroProduto(
            produto.quantidade
        ),

        valor_total: converterNumeroProduto(
            produto.valor_total ??
            produto.valorTotal ??
            0
        ),

        endereco: String(
            produto.endereco || ""
        )
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "")
    };
}


// =====================================================
// BUSCAR PRODUTOS
// =====================================================

async function buscarProdutosSupabase() {
    if (!verificarConexaoSupabase()) {
        return [];
    }

    const { data, error } = await window.supabaseClient
        .from(NOME_TABELA_PRODUTOS)
        .select("*")
        .order("endereco", {
            ascending: true
        });

    if (error) {
        console.error(
            "Erro ao buscar produtos:",
            error
        );

        alert(
            "Não foi possível carregar os produtos do banco online.\n\n" +
            error.message
        );

        return [];
    }

    return Array.isArray(data)
        ? data.map(normalizarProdutoBanco)
        : [];
}


// =====================================================
// INSERIR UM PRODUTO
// =====================================================

async function inserirProdutoSupabase(produto) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const dadosBanco =
        prepararProdutoParaBanco(produto);

    const { error } = await window.supabaseClient
        .from(NOME_TABELA_PRODUTOS)
        .insert([dadosBanco]);

    if (error) {
        console.error(
            "Erro ao inserir produto:",
            error
        );

        alert(
            "Erro ao salvar produto:\n\n" +
            error.message
        );

        return false;
    }

    return true;
}


// =====================================================
// IMPORTAR PLANILHA PARA O SUPABASE
// =====================================================

async function salvarProdutosImportadosSupabase(
    produtos,
    substituirEstoque
) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    if (
        !Array.isArray(produtos) ||
        produtos.length === 0
    ) {
        alert(
            "Nenhum produto válido foi encontrado para salvar."
        );

        return false;
    }

    const produtosBanco = produtos
        .map(prepararProdutoParaBanco)
        .filter(function (produto) {
            return (
                produto.codigo !== "" ||
                produto.descricao !== "" ||
                produto.nf !== "" ||
                produto.endereco !== ""
            );
        });

    if (produtosBanco.length === 0) {
        alert(
            "Nenhum produto válido foi reconhecido na planilha."
        );

        return false;
    }

    if (substituirEstoque) {
        const { error: erroExclusao } =
            await window.supabaseClient
                .from(NOME_TABELA_PRODUTOS)
                .delete()
                .neq("id", 0);

        if (erroExclusao) {
            console.error(
                "Erro ao limpar produtos antigos:",
                erroExclusao
            );

            alert(
                "Não foi possível substituir o estoque antigo.\n\n" +
                erroExclusao.message
            );

            return false;
        }
    }

    const TAMANHO_LOTE = 500;

    for (
        let inicio = 0;
        inicio < produtosBanco.length;
        inicio += TAMANHO_LOTE
    ) {
        const lote = produtosBanco.slice(
            inicio,
            inicio + TAMANHO_LOTE
        );

      const resposta = await window.supabaseClient
    .from(NOME_TABELA_PRODUTOS)
    .insert(lote);

console.log("RESPOSTA DO SUPABASE:");
console.log(resposta);

const error = resposta.error;

        if (error) {
            console.error(
                "Erro ao inserir lote de produtos:",
                error
            );

            alert(
                "A importação parou no produto " +
                (inicio + 1) +
                ".\n\nErro: " +
                error.message
            );

            return false;
        }
    }

    return true;
}

// =====================================================
// CONVERTER LINHA DA PLANILHA EM PRODUTO
// =====================================================

function obterValorColunaProduto(linha, nomesPossiveis) {
    if (!linha || typeof linha !== "object") {
        return "";
    }

    const chaves = Object.keys(linha);

    for (const nomePossivel of nomesPossiveis) {
        const nomeNormalizado = String(nomePossivel)
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");

        const chaveEncontrada = chaves.find(function (chave) {
            return String(chave)
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "") === nomeNormalizado;
        });

        if (chaveEncontrada !== undefined) {
            return linha[chaveEncontrada];
        }
    }

    return "";
}


function criarProdutoImportado(linha) {
    return {
        nf: String(
            obterValorColunaProduto(
                linha,
                [
                    "NF",
                    "Nota Fiscal",
                    "Nota",
                    "Número NF"
                ]
            ) || ""
        ).trim(),

        codigo: String(
            obterValorColunaProduto(
                linha,
                [
                    "Código",
                    "Codigo",
                    "Cod",
                    "Código Produto",
                    "Cod Produto",
                    "SKU",
                    "Material"
                ]
            ) || ""
        ).trim(),

        descricao: String(
            obterValorColunaProduto(
                linha,
                [
                    "Descrição",
                    "Descricao",
                    "Produto",
                    "Descrição Produto",
                    "Nome Produto"
                ]
            ) || ""
        ).trim(),

        cliente: String(
            obterValorColunaProduto(
                linha,
                [
                    "Cliente",
                    "Nome Cliente"
                ]
            ) || "SMI"
        ).trim() || "SMI",

        quantidade: converterNumeroProduto(
            obterValorColunaProduto(
                linha,
                [
                    "Quantidade",
                    "Qtde",
                    "Qtd",
                    "Saldo",
                    "Quantidade Total"
                ]
            )
        ),

        valorTotal: converterNumeroProduto(
            obterValorColunaProduto(
                linha,
                [
                    "Valor Total",
                    "Valor",
                    "Valor Estoque",
                    "Total"
                ]
            )
        ),

        endereco: String(
            obterValorColunaProduto(
                linha,
                [
                    "Endereço",
                    "Endereco",
                    "Posição",
                    "Posicao",
                    "Localização",
                    "Localizacao"
                ]
            ) || ""
        )
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "")
    };
}


// =====================================================
// SUBSTITUI A IMPORTAÇÃO ANTIGA DO PRODUTOS.HTML
// =====================================================

async function processarProdutosImportados(linhas) {
    const botaoImportar =
        document.getElementById(
            "btnImportarProdutos"
        );

    try {
        if (
            !Array.isArray(linhas) ||
            linhas.length === 0
        ) {
            alert("A planilha está vazia.");
            return;
        }

        if (
            typeof criarProdutoImportado !==
            "function"
        ) {
            alert(
                "A função de leitura da planilha não foi encontrada."
            );

            return;
        }

        const produtosImportados = linhas
            .map(function (linha) {
                return criarProdutoImportado(linha);
            })
            .filter(function (produto) {
                return (
                    produto.codigo !== "" ||
                    produto.descricao !== "" ||
                    produto.nf !== "" ||
                    produto.endereco !== ""
                );
            });

        if (produtosImportados.length === 0) {
            alert(
                "Nenhum produto foi reconhecido.\n\n" +
                "Verifique as colunas da planilha."
            );

            return;
        }

        if (botaoImportar) {
            botaoImportar.disabled = true;
            botaoImportar.textContent =
                "⏳ Salvando no banco...";
        }

        const produtosExistentes =
            await buscarProdutosSupabase();

        let substituirEstoque = true;

        if (produtosExistentes.length > 0) {
            substituirEstoque = confirm(
                "Já existem " +
                produtosExistentes.length +
                " produtos no banco.\n\n" +
                "Clique em OK para SUBSTITUIR o estoque atual.\n" +
                "Clique em Cancelar para ACRESCENTAR os novos produtos."
            );
        }

        const salvou =
            await salvarProdutosImportadosSupabase(
                produtosImportados,
                substituirEstoque
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

        await carregarTabelaProdutosSupabase();

        alert(
            produtosImportados.length +
            " produto(s) salvos no banco online com sucesso!"
        );

    } catch (erro) {
        console.error(
            "Erro durante a importação:",
            erro
        );

        alert(
            "Não foi possível concluir a importação.\n\n" +
            erro.message
        );

    } finally {
        if (botaoImportar) {
            botaoImportar.disabled = false;
            botaoImportar.textContent =
                "📥 Importar Dados";
        }
    }
}


// =====================================================
// ATUALIZAR PRODUTO
// =====================================================

async function atualizarProdutoSupabase(
    id,
    produto
) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const dadosBanco =
        prepararProdutoParaBanco(produto);

    const { error } = await window.supabaseClient
        .from(NOME_TABELA_PRODUTOS)
        .update(dadosBanco)
        .eq("id", id);

    if (error) {
        console.error(
            "Erro ao atualizar produto:",
            error
        );

        alert(
            "Não foi possível atualizar o produto.\n\n" +
            error.message
        );

        return false;
    }

    return true;
}


// =====================================================
// EXCLUIR PRODUTO
// =====================================================

async function excluirProdutoSupabase(id) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const { error } = await window.supabaseClient
        .from(NOME_TABELA_PRODUTOS)
        .delete()
        .eq("id", id);

    if (error) {
        console.error(
            "Erro ao excluir produto:",
            error
        );

        alert(
            "Não foi possível excluir o produto.\n\n" +
            error.message
        );

        return false;
    }

    return true;
}


// =====================================================
// FORMATAÇÃO DA TABELA
// =====================================================

function criarCelulaProduto(texto) {
    const celula =
        document.createElement("td");

    celula.textContent =
        texto === undefined ||
        texto === null ||
        texto === ""
            ? "-"
            : texto;

    return celula;
}


function formatarQuantidadeProduto(valor) {
    return converterNumeroProduto(valor)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }
        );
}


function formatarValorProduto(valor) {
    return converterNumeroProduto(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}


// =====================================================
// CARREGAR TABELA
// =====================================================

async function carregarTabelaProdutosSupabase() {
    const tabela =
        document.getElementById(
            "listaProdutos"
        );

    if (!tabela) {
        return;
    }

    tabela.innerHTML =
        "<tr>" +
        "<td colspan='8' class='produtos-vazio'>" +
        "Carregando produtos..." +
        "</td>" +
        "</tr>";

    const produtos =
        await buscarProdutosSupabase();

    tabela.innerHTML = "";

    if (produtos.length === 0) {
        tabela.innerHTML =
            "<tr>" +
            "<td colspan='8' class='produtos-vazio'>" +
            "Nenhum produto cadastrado." +
            "</td>" +
            "</tr>";

        atualizarFiltroClientesSupabase([]);
        return;
    }

    produtos.sort(function (a, b) {
        return String(a.endereco || "")
            .localeCompare(
                String(b.endereco || ""),
                "pt-BR",
                {
                    numeric: true
                }
            );
    });

    produtos.forEach(function (produto) {
        const linha =
            document.createElement("tr");

        linha.dataset.id = produto.id;
        linha.dataset.codigo =
            produto.codigo || "";

        linha.appendChild(
            criarCelulaProduto(produto.codigo)
        );

        linha.appendChild(
            criarCelulaProduto(
                produto.descricao
            )
        );

        const celulaCliente =
            document.createElement("td");

        const cliente =
            document.createElement("span");

        cliente.className =
            "cliente-produto";

        cliente.textContent =
            produto.cliente || "SMI";

        celulaCliente.appendChild(cliente);
        linha.appendChild(celulaCliente);

        linha.appendChild(
            criarCelulaProduto(
                formatarQuantidadeProduto(
                    produto.quantidade
                )
            )
        );

        linha.appendChild(
            criarCelulaProduto(
                formatarValorProduto(
                    produto.valorTotal
                )
            )
        );

        const celulaEndereco =
            document.createElement("td");

        const endereco =
            document.createElement("span");

        endereco.className =
            "endereco-produto";

        endereco.textContent =
            produto.endereco || "-";

        celulaEndereco.appendChild(endereco);
        linha.appendChild(celulaEndereco);

        const celulaAcoes =
            document.createElement("td");

        const acoes =
            document.createElement("div");

        acoes.className =
            "acoes-produto";

        const botaoEditar =
            document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.className =
            "btn-editar-produto";
        botaoEditar.textContent = "✏️";
        botaoEditar.title =
            "Editar produto";

        botaoEditar.addEventListener(
            "click",
            function () {
                editarProdutoSupabase(produto);
            }
        );

        const botaoExcluir =
            document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.className =
            "btn-excluir-produto";
        botaoExcluir.textContent = "🗑️";
        botaoExcluir.title =
            "Excluir produto";

        botaoExcluir.addEventListener(
            "click",
            function () {
                confirmarExclusaoProdutoSupabase(
                    produto
                );
            }
        );

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);

        tabela.appendChild(linha);
    });

    atualizarFiltroClientesSupabase(produtos);
}


// =====================================================
// EDITAR
// =====================================================

async function editarProdutoSupabase(produto) {
    const novaDescricao = prompt(
        "Descrição do produto:",
        produto.descricao || ""
    );

    if (novaDescricao === null) {
        return;
    }

    const novaQuantidade = prompt(
        "Quantidade:",
        produto.quantidade ?? 0
    );

    if (novaQuantidade === null) {
        return;
    }

    const novoValorTotal = prompt(
        "Valor Total:",
        produto.valorTotal ?? 0
    );

    if (novoValorTotal === null) {
        return;
    }

    const novoEndereco = prompt(
        "Endereço:",
        produto.endereco || ""
    );

    if (novoEndereco === null) {
        return;
    }

    const atualizou =
        await atualizarProdutoSupabase(
            produto.id,
            {
                nf: produto.nf || "",
                codigo: produto.codigo || "",
                descricao:
                    String(novaDescricao).trim(),
                cliente:
                    produto.cliente || "SMI",
                quantidade:
                    converterNumeroProduto(
                        novaQuantidade
                    ),
                valorTotal:
                    converterNumeroProduto(
                        novoValorTotal
                    ),
                endereco:
                    String(novoEndereco).trim()
            }
        );

    if (!atualizou) {
        return;
    }

    alert(
        "Produto atualizado no banco online."
    );

    await carregarTabelaProdutosSupabase();
}


// =====================================================
// CONFIRMAR EXCLUSÃO
// =====================================================

async function confirmarExclusaoProdutoSupabase(
    produto
) {
    const confirmou = confirm(
        "Deseja excluir este produto?\n\n" +
        "Código: " +
        (produto.codigo || "-") +
        "\nDescrição: " +
        (produto.descricao || "-") +
        "\nEndereço: " +
        (produto.endereco || "-")
    );

    if (!confirmou) {
        return;
    }

    const excluiu =
        await excluirProdutoSupabase(
            produto.id
        );

    if (!excluiu) {
        return;
    }

    alert(
        "Produto excluído do banco online."
    );

    await carregarTabelaProdutosSupabase();
}


// =====================================================
// FILTRO DE CLIENTES
// =====================================================

function atualizarFiltroClientesSupabase(
    produtos
) {
    const filtro =
        document.getElementById(
            "filtroClienteProdutos"
        );

    if (!filtro) {
        return;
    }

    const clienteAtual = filtro.value;

    const clientes = [
        ...new Set(
            produtos
                .map(function (produto) {
                    return String(
                        produto.cliente || ""
                    ).trim();
                })
                .filter(Boolean)
        )
    ].sort();

    filtro.innerHTML =
        '<option value="">' +
        "Todos os clientes" +
        "</option>";

    clientes.forEach(function (cliente) {
        const opcao =
            document.createElement("option");

        opcao.value = cliente;
        opcao.textContent = cliente;

        filtro.appendChild(opcao);
    });

    filtro.value = clienteAtual;
}


function filtrarProdutosSupabase() {
    const filtro =
        document.getElementById(
            "filtroClienteProdutos"
        );

    if (!filtro) {
        return;
    }

    const clienteSelecionado =
        filtro.value.trim().toLowerCase();

    const linhas =
        document.querySelectorAll(
            "#listaProdutos tr"
        );

    linhas.forEach(function (linha) {
        const celulaCliente =
            linha.querySelector(
                ".cliente-produto"
            );

        if (!celulaCliente) {
            return;
        }

        const clienteLinha =
            celulaCliente.textContent
                .trim()
                .toLowerCase();

        linha.style.display =
            clienteSelecionado === "" ||
            clienteLinha === clienteSelecionado
                ? ""
                : "none";
    });
}


// =====================================================
// DISPONIBILIZA AS FUNÇÕES PARA O PRODUTOS.HTML
// =====================================================

window.buscarProdutosSupabase =
    buscarProdutosSupabase;

window.inserirProdutoSupabase =
    inserirProdutoSupabase;

window.salvarProdutosImportadosSupabase =
    salvarProdutosImportadosSupabase;

window.processarProdutosImportados =
    processarProdutosImportados;

window.carregarTabelaProdutosSupabase =
    carregarTabelaProdutosSupabase;

window.carregarTabelaProdutos =
    carregarTabelaProdutosSupabase;

window.carregarProdutosDoBanco =
    carregarTabelaProdutosSupabase;

window.filtrarProdutosAvancado =
    filtrarProdutosSupabase;

window.editarProdutoSupabase =
    editarProdutoSupabase;

window.excluirProdutoSupabase =
    excluirProdutoSupabase;

// =====================================================
// INICIALIZAÇÃO DA TELA DE PRODUTOS
// =====================================================

// =====================================================
// INICIALIZAÇÃO ÚNICA DA TELA DE PRODUTOS
// =====================================================

async function iniciarTelaProdutosSupabase() {
    await carregarTabelaProdutosSupabase();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarTelaProdutosSupabase,
        { once: true }
    );
} else {
    iniciarTelaProdutosSupabase();
}