// =====================================================
// SMI WMS — PRODUTOS INTEGRADOS AO SUPABASE
// Importação de Excel: somente mínimo e máximo
// =====================================================

var NOME_TABELA_PRODUTOS = "produtos";
var importacaoLimitesEmAndamento = false;

// =====================================================
// CONEXÃO E CONVERSÕES
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
        texto = texto.replace(/\./g, "").replace(",", ".");
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

        descricaoDetalhada:
            produto.descricao_detalhada ??
            produto.descricaoDetalhada ??
            "",

        cliente: produto.cliente || "SMI",

        quantidade: converterNumeroProduto(
            produto.quantidade
        ),

        minimo: converterNumeroProduto(
            produto.minimo ??
            produto.estoque_minimo ??
            0
        ),

        maximo: converterNumeroProduto(
            produto.maximo ??
            produto.estoque_maximo ??
            0
        ),

        ncm: produto.ncm ?? produto.NCM ?? "",
        ipi: produto.ipi ?? produto.IPI ?? "",

        valorUnitario: converterNumeroProduto(
            produto.valor_unitario ??
            produto.valorUnitario ??
            0
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
    const ipi = produto.ipi ?? produto.IPI ?? "";

    return {
        nf: String(produto.nf || "").trim(),
        codigo: String(produto.codigo || "").trim(),
        descricao: String(produto.descricao || "").trim(),

        descricao_detalhada: String(
            produto.descricao_detalhada ??
            produto.descricaoDetalhada ??
            ""
        ).trim(),

        cliente:
            String(produto.cliente || "SMI").trim() ||
            "SMI",

        quantidade: converterNumeroProduto(
            produto.quantidade
        ),

        minimo: converterNumeroProduto(
            produto.minimo ??
            produto.estoque_minimo ??
            0
        ),

        maximo: converterNumeroProduto(
            produto.maximo ??
            produto.estoque_maximo ??
            0
        ),

        ncm: String(
            produto.ncm ?? produto.NCM ?? ""
        ).trim(),

        ipi:
            String(ipi).trim() === ""
                ? null
                : converterNumeroProduto(ipi),

        valor_unitario: converterNumeroProduto(
            produto.valor_unitario ??
            produto.valorUnitario ??
            0
        ),

        valor_total: converterNumeroProduto(
            produto.valor_total ??
            produto.valorTotal ??
            0
        ),

        endereco: String(produto.endereco || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "")
    };
}

// =====================================================
// CONSULTAR TODOS OS PRODUTOS
// =====================================================

async function buscarProdutosSupabase() {
    if (!verificarConexaoSupabase()) {
        return [];
    }

    const todosProdutos = [];
    const tamanhoPagina = 1000;

    for (let inicio = 0; ; inicio += tamanhoPagina) {
        const { data, error } =
            await window.supabaseClient
                .from(NOME_TABELA_PRODUTOS)
                .select("*")
                .order("id", { ascending: true })
                .range(
                    inicio,
                    inicio + tamanhoPagina - 1
                );

        if (error) {
            console.error(
                "Erro ao buscar produtos:",
                error
            );

            alert(
                "Não foi possível carregar os produtos.\n\n" +
                error.message
            );

            return [];
        }

        if (!Array.isArray(data) || data.length === 0) {
            break;
        }

        todosProdutos.push(
            ...data.map(normalizarProdutoBanco)
        );

        if (data.length < tamanhoPagina) {
            break;
        }
    }

    console.log(
        "TOTAL DE PRODUTOS CARREGADOS:",
        todosProdutos.length
    );

    return todosProdutos;
}

// =====================================================
// CADASTRO INDIVIDUAL
// =====================================================

async function inserirProdutoSupabase(produto) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const { error } =
        await window.supabaseClient
            .from(NOME_TABELA_PRODUTOS)
            .insert([
                prepararProdutoParaBanco(produto)
            ]);

    if (error) {
        console.error(
            "Erro ao inserir produto:",
            error
        );

        alert(
            "Não foi possível cadastrar o produto.\n\n" +
            error.message
        );

        return false;
    }

    return true;
}

// A importação antiga de estoque completo fica bloqueada.
// O Excel deve passar por processarProdutosImportados.

async function salvarProdutosImportadosSupabase() {
    alert(
        "Use a importação de mínimo e máximo. " +
        "A substituição de estoque por planilha " +
        "está desativada neste script."
    );

    return false;
}

// =====================================================
// IDENTIFICAR COLUNAS DA PLANILHA
// =====================================================

function chaveColunaLimites(texto) {
    return String(texto)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function lerColunaLimites(linha, nomes) {
    const chave = Object.keys(linha).find(
        k => nomes.includes(chaveColunaLimites(k))
    );

    return chave === undefined
        ? undefined
        : linha[chave];
}

function obterValorColunaProduto(
    linha,
    nomesPossiveis
) {
    if (!linha || typeof linha !== "object") {
        return "";
    }

    const chaves = Object.keys(linha);

    for (const nome of nomesPossiveis) {
        const chave = chaves.find(
            k =>
                chaveColunaLimites(k) ===
                chaveColunaLimites(nome)
        );

        if (chave !== undefined) {
            return linha[chave];
        }
    }

    return "";
}

function criarProdutoImportado(linha) {
    const ler = nomes =>
        obterValorColunaProduto(linha, nomes);

    return {
        nf: String(
            ler(["NF", "Nota Fiscal", "Nota", "Número NF"]) ||
            ""
        ).trim(),

        codigo: String(
            ler([
                "Código",
                "Cod",
                "Código Produto",
                "Cod Produto",
                "SKU",
                "Material"
            ]) || ""
        ).trim(),

        descricao: String(
            ler([
                "Descrição",
                "Produto",
                "Descrição Produto",
                "Nome Produto"
            ]) || ""
        ).trim(),

        descricaoDetalhada: String(
            ler(["Descrição Detalhada"]) || ""
        ).trim(),

        cliente: "SMI",

        quantidade: converterNumeroProduto(
            ler([
                "Quantidade",
                "Qtd",
                "Qtde",
                "Saldo",
                "Quantidade Total"
            ])
        ),

        minimo: converterNumeroProduto(
            ler(["Mínimo", "Estoque Mínimo"])
        ),

        maximo: converterNumeroProduto(
            ler(["Máximo", "Estoque Máximo"])
        ),

        ncm: String(ler(["NCM"]) || "").trim(),
        ipi: ler(["IPI"]),

        valorUnitario: converterNumeroProduto(
            ler(["Valor Unitário"])
        ),

        valorTotal: converterNumeroProduto(
            ler([
                "Valor Total",
                "Valor",
                "Valor Estoque",
                "Total"
            ])
        ),

        endereco: String(
            ler([
                "Posição",
                "Endereço",
                "Localização"
            ]) || ""
        )
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "")
    };
}

// =====================================================
// VALIDAR MÍNIMO E MÁXIMO
// =====================================================

function numeroLimiteImportado(
    valor,
    linha,
    campo
) {
    // Vazio preserva o valor atual.
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return undefined;
    }

    let texto = String(valor).trim();

    if (typeof valor !== "number") {
        if (!/^\d+(?:[.,]\d+)*$/.test(texto)) {
            throw new Error(
                "Linha " + linha + ": " +
                campo + " inválido."
            );
        }

        if (texto.includes(",")) {
            texto = texto
                .replace(/\./g, "")
                .replace(",", ".");
        }
    }

    const numero = Number(texto);

    if (!Number.isFinite(numero) || numero < 0) {
        throw new Error(
            "Linha " + linha + ": " +
            campo + " inválido."
        );
    }

    return numero;
}

// =====================================================
// IMPORTAÇÃO: SOMENTE MÍNIMO E MÁXIMO
// =====================================================

async function processarProdutosImportados(linhas) {
    if (
        importacaoLimitesEmAndamento ||
        !verificarConexaoSupabase()
    ) {
        return;
    }

    const botao =
        document.getElementById("btnImportarProdutos");

    let atualizados = 0;

    importacaoLimitesEmAndamento = true;

    try {
        if (
            !Array.isArray(linhas) ||
            linhas.length === 0
        ) {
            throw new Error("A planilha está vazia.");
        }

        const porCodigo = new Map();

        // Valida todas as linhas antes de gravar.
        linhas.forEach((linha, i) => {
            const raw = lerColunaLimites(
                linha,
                [
                    "codigo",
                    "cod",
                    "codigoproduto",
                    "codproduto",
                    "sku",
                    "material"
                ]
            );

            const codigo = String(raw ?? "")
                .trim()
                .toUpperCase();

            if (!codigo) {
                const preenchida =
                    Object.values(linha).some(
                        v =>
                            v !== null &&
                            String(v).trim() !== ""
                    );

                if (preenchida) {
                    throw new Error(
                        "Linha " + (i + 2) +
                        ": código ausente."
                    );
                }

                return;
            }

            const minimo = numeroLimiteImportado(
                lerColunaLimites(
                    linha,
                    ["minimo", "estoqueminimo"]
                ),
                i + 2,
                "mínimo"
            );

            const maximo = numeroLimiteImportado(
                lerColunaLimites(
                    linha,
                    ["maximo", "estoquemaximo"]
                ),
                i + 2,
                "máximo"
            );

            if (
                minimo === undefined &&
                maximo === undefined
            ) {
                return;
            }

            const anterior =
                porCodigo.get(codigo) || {};

            for (
                const [campo, valor]
                of Object.entries({ minimo, maximo })
            ) {
                if (valor === undefined) {
                    continue;
                }

                if (
                    anterior[campo] !== undefined &&
                    anterior[campo] !== valor
                ) {
                    throw new Error(
                        "Limites diferentes para o código " +
                        codigo +
                        ". Corrija as linhas repetidas."
                    );
                }

                anterior[campo] = valor;
            }

            porCodigo.set(codigo, anterior);
        });

        if (porCodigo.size === 0) {
            throw new Error(
                "Nenhum mínimo ou máximo preenchido. " +
                "Colunas vazias preservam os valores atuais."
            );
        }

        if (botao) {
            botao.disabled = true;

            botao.textContent =
                "Atualizando mínimo e máximo...";
        }

        // Consulta direta: erros interrompem a importação.
        const existentes = [];

        for (let inicio = 0; ; inicio += 1000) {
            const { data, error } =
                await window.supabaseClient
                    .from(NOME_TABELA_PRODUTOS)
                    .select("id,codigo,minimo,maximo")
                    .order("id", { ascending: true })
                    .range(inicio, inicio + 999);

            if (error) {
                throw error;
            }

            if (!Array.isArray(data)) {
                throw new Error(
                    "Resposta inválida ao consultar produtos."
                );
            }

            existentes.push(...data);

            if (data.length < 1000) {
                break;
            }
        }

        const encontrados = new Set();
        const alteracoes = [];

        existentes.forEach(produto => {
            const codigo = String(
                produto.codigo ?? ""
            )
                .trim()
                .toUpperCase();

            const limites = porCodigo.get(codigo);

            if (!limites) {
                return;
            }

            encontrados.add(codigo);

            const minimo =
                limites.minimo ??
                Number(produto.minimo ?? 0);

            const maximo =
                limites.maximo ??
                Number(produto.maximo ?? 0);

            // Máximo zero mantém a convenção de sem limite.
            if (maximo > 0 && minimo > maximo) {
                throw new Error(
                    "Mínimo maior que máximo para " +
                    codigo + "."
                );
            }

            const patch = {};

            for (const campo of ["minimo", "maximo"]) {
                if (
                    limites[campo] !== undefined &&
                    Number(produto[campo]) !==
                        limites[campo]
                ) {
                    patch[campo] = limites[campo];
                }
            }

            if (Object.keys(patch).length > 0) {
                alteracoes.push({
                    id: produto.id,
                    codigo: produto.codigo,
                    patch
                });
            }
        });

        // Grava apenas os campos mínimo e máximo.
        // Não grava quantidade, endereço ou outros dados.
        for (const item of alteracoes) {
            const { data, error } =
                await window.supabaseClient
                    .from(NOME_TABELA_PRODUTOS)
                    .update(item.patch)
                    .eq("id", item.id)
                    .eq("codigo", item.codigo)
                    .select("id,minimo,maximo");

            if (error) {
                throw error;
            }

            const confirmou =
                Array.isArray(data) &&
                data.length === 1 &&
                Object.entries(item.patch).every(
                    ([campo, valor]) =>
                        Number(data[0][campo]) === valor
                );

            if (!confirmou) {
                throw new Error(
                    "Não foi possível confirmar " +
                    "a atualização de " +
                    item.codigo + "."
                );
            }

            atualizados++;
        }

        await carregarTabelaProdutosSupabase();

        const ignorados = [
            ...porCodigo.keys()
        ].filter(
            codigo => !encontrados.has(codigo)
        );

        let mensagem =
            "Mínimo e máximo atualizados em " +
            atualizados + " registro(s).\n" +
            "Quantidade e posição preservadas.";

        if (ignorados.length > 0) {
            mensagem +=
                "\nCódigos não cadastrados " +
                "(não incluídos): " +
                ignorados.join(", ");
        }

        alert(mensagem);

        const arquivo =
            document.getElementById("arquivoExcel");

        if (arquivo) {
            arquivo.value = "";
        }
    } catch (erro) {
        console.error(
            "Erro na importação de limites:",
            erro
        );

        alert(
            "Importação interrompida: " +
            erro.message +
            "\nRegistros já atualizados: " +
            atualizados +
            ".\nA planilha pode ser reenviada " +
            "após corrigir o problema."
        );
    } finally {
        importacaoLimitesEmAndamento = false;

        if (botao) {
            botao.disabled = false;
            botao.textContent = "Importar Dados";
        }
    }
}

// =====================================================
// ATUALIZAR E EXCLUIR PRODUTO INDIVIDUAL
// =====================================================

async function atualizarProdutoSupabase(
    id,
    produto
) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const { error } =
        await window.supabaseClient
            .from(NOME_TABELA_PRODUTOS)
            .update(
                prepararProdutoParaBanco(produto)
            )
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

async function excluirProdutoSupabase(id) {
    if (!verificarConexaoSupabase()) {
        return false;
    }

    const { error } =
        await window.supabaseClient
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
// FORMATAÇÃO
// =====================================================

function criarCelulaProduto(texto) {
    const celula = document.createElement("td");

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
        .toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
}

function formatarValorProduto(valor) {
    return converterNumeroProduto(valor)
        .toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
}

// =====================================================
// CARREGAR TABELA
// Usa o renderizador oficial de produtos.html.
// =====================================================

async function carregarTabelaProdutosSupabase() {
    if (
        typeof window.carregarTodosOsProdutosNaTela ===
        "function"
    ) {
        await window.carregarTodosOsProdutosNaTela();
        return;
    }

    await buscarProdutosSupabase();
}

// =====================================================
// EDIÇÃO INDIVIDUAL
// =====================================================

async function editarProdutoSupabase(produto) {
    const novaDescricao = prompt(
        "Descrição do produto:",
        produto.descricao || ""
    );

    if (novaDescricao === null) return;

    const novaQuantidade = prompt(
        "Quantidade:",
        produto.quantidade ?? 0
    );

    if (novaQuantidade === null) return;

    const novoMinimo = prompt(
        "Estoque Mínimo:",
        produto.minimo ??
        produto.estoque_minimo ??
        0
    );

    if (novoMinimo === null) return;

    const novoMaximo = prompt(
        "Estoque Máximo:",
        produto.maximo ??
        produto.estoque_maximo ??
        0
    );

    if (novoMaximo === null) return;

    const novoValorTotal = prompt(
        "Valor Total:",
        produto.valorTotal ??
        produto.valor_total ??
        0
    );

    if (novoValorTotal === null) return;

    const novoEndereco = prompt(
        "Endereço:",
        produto.endereco || ""
    );

    if (novoEndereco === null) return;

    const atualizou = await atualizarProdutoSupabase(
        produto.id,
        {
            nf: produto.nf || "",
            codigo: produto.codigo || "",

            descricao: String(novaDescricao).trim(),

            descricaoDetalhada:
                produto.descricao_detalhada ??
                produto.descricaoDetalhada ??
                "",

            cliente: produto.cliente || "SMI",

            quantidade:
                converterNumeroProduto(novaQuantidade),

            minimo:
                converterNumeroProduto(novoMinimo),

            maximo:
                converterNumeroProduto(novoMaximo),

            ncm: produto.ncm ?? produto.NCM ?? "",
            ipi: produto.ipi ?? produto.IPI ?? "",

            valorUnitario:
                produto.valor_unitario ??
                produto.valorUnitario ??
                0,

            valorTotal:
                converterNumeroProduto(novoValorTotal),

            endereco: String(novoEndereco).trim()
        }
    );

    if (!atualizou) return;

    alert("Produto atualizado no banco online.");

    await carregarTabelaProdutosSupabase();
}

async function confirmarExclusaoProdutoSupabase(
    produto
) {
    const confirmou = confirm(
        "Deseja excluir este produto?\n\n" +
        "Código: " + (produto.codigo || "-") +
        "\nDescrição: " + (produto.descricao || "-") +
        "\nEndereço: " + (produto.endereco || "-")
    );

    if (!confirmou) return;

    const excluiu =
        await excluirProdutoSupabase(produto.id);

    if (!excluiu) return;

    alert("Produto excluído do banco online.");

    await carregarTabelaProdutosSupabase();
}

// =====================================================
// FILTRO DE CLIENTES
// =====================================================

function atualizarFiltroClientesSupabase(produtos) {
    const filtro = document.getElementById(
        "filtroClienteProdutos"
    );

    if (!filtro) return;

    const clienteAtual = filtro.value;

    const clientes = [
        ...new Set(
            produtos
                .map(
                    produto =>
                        String(produto.cliente || "").trim()
                )
                .filter(Boolean)
        )
    ].sort();

    filtro.innerHTML =
        '<option value="">Todos os clientes</option>';

    clientes.forEach(cliente => {
        const opcao = document.createElement("option");

        opcao.value = cliente;
        opcao.textContent = cliente;

        filtro.appendChild(opcao);
    });

    filtro.value = clienteAtual;
}

function filtrarProdutosSupabase() {
    const filtro = document.getElementById(
        "filtroClienteProdutos"
    );

    if (!filtro) return;

    const clienteSelecionado =
        filtro.value.trim().toLowerCase();

    document.querySelectorAll(
        "#listaProdutos tr"
    ).forEach(linha => {
        const celulaCliente =
            linha.querySelector(".cliente-produto");

        if (!celulaCliente) return;

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
// EXPORTAÇÃO
// =====================================================

async function buscarTodosProdutosParaExportacao() {
    const todosProdutos = [];
    const tamanhoPagina = 1000;

    for (let inicio = 0; ; inicio += tamanhoPagina) {
        const { data, error } =
            await window.supabaseClient
                .from(NOME_TABELA_PRODUTOS)
                .select("*")
                .order("id", { ascending: true })
                .range(
                    inicio,
                    inicio + tamanhoPagina - 1
                );

        if (error) throw error;

        if (!Array.isArray(data) || data.length === 0) {
            break;
        }

        todosProdutos.push(...data);

        if (data.length < tamanhoPagina) {
            break;
        }
    }

    console.log("TOTAL:", todosProdutos.length);

    return todosProdutos;
}

async function exportarEstoqueExcel() {
    try {
        if (typeof XLSX === "undefined") {
            alert(
                "A biblioteca do Excel não foi carregada."
            );

            return;
        }

        const produtos =
            await buscarTodosProdutosParaExportacao();

        if (
            !Array.isArray(produtos) ||
            produtos.length === 0
        ) {
            alert("Não existem produtos para exportar.");
            return;
        }

        const dadosExportacao = produtos.map(produto => {
            const quantidade = converterNumeroProduto(
                produto.quantidade
            );

            const minimo = converterNumeroProduto(
                produto.minimo ??
                produto.estoque_minimo ??
                0
            );

            const maximo = converterNumeroProduto(
                produto.maximo ??
                produto.estoque_maximo ??
                0
            );

            const valorTotal = converterNumeroProduto(
                produto.valor_total ??
                produto.valorTotal ??
                0
            );

            let valorUnitario = converterNumeroProduto(
                produto.valor_unitario ??
                produto.valorUnitario ??
                0
            );

            if (
                valorUnitario === 0 &&
                quantidade > 0 &&
                valorTotal > 0
            ) {
                valorUnitario = valorTotal / quantidade;
            }

            return {
                "Código": produto.codigo || "",
                "Descrição": produto.descricao || "",

                "Descrição detalhada":
                    produto.descricao_detalhada ??
                    produto.descricaoDetalhada ??
                    "",

                "Quantidade": quantidade,
                "Mínimo": minimo,
                "Máximo": maximo,

                "Status":
                    minimo > 0 && quantidade < minimo
                        ? "Abaixo do mínimo"
                        : "Normal",

                "NCM": produto.ncm ?? produto.NCM ?? "",
                "IPI": produto.ipi ?? produto.IPI ?? "",
                "Valor Unitário": valorUnitario,
                "Valor Total": valorTotal,
                "Posição": produto.endereco || ""
            };
        });

        const planilha =
            XLSX.utils.json_to_sheet(dadosExportacao);

        planilha["!cols"] = [
            { wch: 18 },
            { wch: 40 },
            { wch: 55 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 20 },
            { wch: 18 },
            { wch: 12 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 }
        ];

        const arquivoExcel = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            arquivoExcel,
            planilha,
            "Estoque"
        );

        const dataAtual = new Date()
            .toLocaleDateString("pt-BR")
            .replace(/\//g, "-");

        XLSX.writeFile(
            arquivoExcel,
            "Relatorio_Estoque_" + dataAtual + ".xlsx"
        );

        console.log(
            "TOTAL EXPORTADO:",
            produtos.length
        );
    } catch (erro) {
        console.error(
            "Erro ao exportar estoque:",
            erro
        );

        alert(
            "Não foi possível exportar o estoque.\n\n" +
            erro.message
        );
    }
}

// =====================================================
// LIMPAR PRODUTOS — AÇÃO MANUAL EXISTENTE
// =====================================================

async function limparTodosProdutosSupabase() {
    const confirmou = confirm(
        "ATENÇÃO!\n\n" +
        "Tem certeza que deseja excluir " +
        "TODOS os produtos cadastrados?\n\n" +
        "Esta ação limpará completamente " +
        "a base de Produtos."
    );

    if (!confirmou) return;

    const confirmouNovamente = confirm(
        "CONFIRMAÇÃO FINAL\n\n" +
        "Todos os produtos serão apagados " +
        "da tabela Produtos.\n\n" +
        "Deseja continuar?"
    );

    if (!confirmouNovamente) return;

    try {
        if (!verificarConexaoSupabase()) return;

        const { error } =
            await window.supabaseClient
                .from(NOME_TABELA_PRODUTOS)
                .delete()
                .neq("id", 0);

        if (error) throw error;

        alert(
            "Todos os produtos foram excluídos com sucesso."
        );

        await carregarTabelaProdutosSupabase();
    } catch (erro) {
        console.error(
            "Erro ao limpar produtos:",
            erro
        );

        alert(
            "Não foi possível limpar os produtos.\n\n" +
            erro.message
        );
    }
}

// =====================================================
// FUNÇÕES DISPONÍVEIS PARA PRODUTOS.HTML
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

window.exportarEstoqueExcel =
    exportarEstoqueExcel;

window.limparTodosProdutosSupabase =
    limparTodosProdutosSupabase;

// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function iniciarTelaProdutosSupabase() {
    console.log("Produtos Supabase disponível.");
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