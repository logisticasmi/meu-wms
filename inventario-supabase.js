// Nova tentativa de publicação — 14/10/2026

// SMI WMS — Inventário com aprovação e reabertura
// Versão: 20261014-contagens-completas

const NOME_TABELA_INVENTARIO = "inventario";
const NOME_TABELA_PRODUTOS = "produtos";

function verificarConexaoInventarioSupabase() {
    if (
        !window.supabaseClient ||
        typeof window.supabaseClient.from !== "function"
    ) {
        alert("Não foi possível conectar o Inventário ao banco online.");
        return false;
    }

    return true;
}

function normalizarTextoInventario(valor) {
    return String(valor || "").trim();
}

function converterNumeroInventarioSupabase(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return 0;
    }

    let texto = String(valor).trim().replace(/\s/g, "");

    if (texto.includes(".") && texto.includes(",")) {
        texto = texto.replace(/\./g, "").replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    texto = texto.replace(/[^0-9.-]/g, "");

    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
}

function obterUsuarioAtualInventario() {
    return (
        localStorage.getItem("usuario") ||
        localStorage.getItem("nomeUsuario") ||
        "Administrador"
    );
}

// Permissão da interface.
// A autorização definitiva deve ser aplicada no banco.
function podeReabrirInventario() {
    return (
        String(obterUsuarioAtualInventario())
            .trim()
            .toLowerCase() === "davi.smi"
    );
}

function contagemReservadaDavi(registro) {
    return (
        String(registro?.observacao || "").includes("[REABERTO_DAVI]") &&
        String(registro?.situacao_aprovacao || "").toUpperCase() !==
            "APROVADO"
    );
}

async function buscarProdutosInventarioSupabase() {
    if (!verificarConexaoInventarioSupabase()) {
        return null;
    }

    const produtos = [];
    const quantidadePorBusca = 1000;
    let inicio = 0;

    while (true) {
        const { data, error } = await window.supabaseClient
            .from(NOME_TABELA_PRODUTOS)
            .select("*")
            .order("id", { ascending: true })
            .range(inicio, inicio + quantidadePorBusca - 1);

        if (error) {
            console.error(error);
            alert("Não foi possível carregar os produtos.\n\n" + error.message);
            return null;
        }

        if (!Array.isArray(data) || data.length === 0) {
            break;
        }

        produtos.push(...data);

        if (data.length < quantidadePorBusca) {
            break;
        }

        inicio += quantidadePorBusca;
    }

    // Inclui produtos zerados que possuem posição.
    return produtos.filter(function (produto) {
        return normalizarTextoInventario(
            produto.endereco || produto.posicao
        ) !== "";
    });
}

// Busca todas as páginas, evitando exibir contagens existentes
// como "Sem contagem".
async function buscarContagensInventarioSupabase() {
    if (!verificarConexaoInventarioSupabase()) {
        throw new Error("Inventário sem conexão com o banco online.");
    }

    const registros = [];
    const tamanhoPagina = 500;
    let inicio = 0;

    while (true) {
        const { data, error } = await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .select("*")
            .order("id", { ascending: true })
            .range(inicio, inicio + tamanhoPagina - 1);

        if (error) {
            console.error("Erro ao carregar contagens:", error);
            throw new Error(
                "Não foi possível carregar todas as contagens online: " +
                error.message
            );
        }

        if (!Array.isArray(data)) {
            throw new Error(
                "Resposta inválida ao carregar contagens online."
            );
        }

        if (data.length === 0) {
            break;
        }

        registros.push(...data);
        inicio += data.length;
    }

    return registros;
}

async function buscarContagemProdutoSupabase(codigo, posicao) {
    if (!verificarConexaoInventarioSupabase()) {
        return null;
    }

    const { data, error } = await window.supabaseClient
        .from(NOME_TABELA_INVENTARIO)
        .select("*")
        .eq("codigo", normalizarTextoInventario(codigo))
        .eq("posicao", normalizarTextoInventario(posicao))
        .order("atualizado_em", { ascending: false })
        .limit(1);

    if (error) {
        console.error("Erro ao buscar contagem:", error);
        return null;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function salvarContagemInventarioSupabase(produto, quantidadeContada) {
    if (!verificarConexaoInventarioSupabase()) {
        return { sucesso: false };
    }

    const codigo = normalizarTextoInventario(produto.codigo);
    const descricao = normalizarTextoInventario(produto.descricao);
    const posicao = normalizarTextoInventario(
        produto.endereco || produto.posicao
    );

    const quantidadeSistema =
        converterNumeroInventarioSupabase(produto.quantidade);

    const quantidadeContadaNumero =
        converterNumeroInventarioSupabase(quantidadeContada);

    if (codigo === "") {
        alert("O produto não possui código para salvar a contagem.");
        return { sucesso: false };
    }

    const registroExistente =
        await buscarContagemProdutoSupabase(codigo, posicao);

    if (
        registroExistente &&
        String(registroExistente.situacao_aprovacao || "")
            .trim()
            .toUpperCase() === "APROVADO"
    ) {
        alert(
            "Este item já foi aprovado. " +
            "Utilize Reabrir contagem antes de corrigir."
        );
        return { sucesso: false };
    }

    if (
        contagemReservadaDavi(registroExistente) &&
        !podeReabrirInventario()
    ) {
        alert("Esta correção está reservada a davi.smi.");
        return { sucesso: false };
    }

    const diferenca = quantidadeContadaNumero - quantidadeSistema;

    const observacao = contagemReservadaDavi(registroExistente)
        ? [
            registroExistente.observacao,
            "Correção por " + obterUsuarioAtualInventario() +
            " em " + new Date().toISOString() +
            " | Quantidade de " +
            registroExistente.quantidade_contada +
            " para " + quantidadeContadaNumero
        ].join("\n")
        : registroExistente?.observacao || null;

    const dadosInventario = {
        codigo,
        descricao,
        posicao,
        quantidade_sistema: quantidadeSistema,
        quantidade_contada: quantidadeContadaNumero,
        diferenca,
        status: diferenca === 0 ? "OK" : "DIVERGENTE",
        usuario: obterUsuarioAtualInventario(),
        atualizado_em: new Date().toISOString(),
        situacao_aprovacao: "PENDENTE",
        aprovado_por: null,
        aprovado_em: null,
        observacao
    };

    let resposta;

    if (registroExistente && registroExistente.id) {
        resposta = await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .update(dadosInventario)
            .eq("id", registroExistente.id)
            .select()
            .single();
    } else {
        resposta = await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .insert([dadosInventario])
            .select()
            .single();
    }

    if (resposta.error) {
        console.error(resposta.error);
        alert(
            "Não foi possível salvar a contagem online.\n\n" +
            resposta.error.message
        );

        return {
            sucesso: false,
            erro: resposta.error
        };
    }

    return {
        sucesso: true,
        registro: resposta.data
    };
}

async function reabrirContagemInventarioSupabase(registro, motivo) {
    if (!podeReabrirInventario()) {
        alert("Somente davi.smi pode reabrir uma contagem aprovada.");
        return { sucesso: false };
    }

    if (!verificarConexaoInventarioSupabase() || !registro?.id) {
        return { sucesso: false };
    }

    const { data: atual, error: erroBusca } = await window.supabaseClient
        .from(NOME_TABELA_INVENTARIO)
        .select("*")
        .eq("id", registro.id)
        .single();

    if (
        erroBusca ||
        !atual ||
        String(atual.situacao_aprovacao).toUpperCase() !== "APROVADO"
    ) {
        alert(
            "Não foi possível reabrir. " +
            "Atualize a tela e confira a situação do item."
        );
        return { sucesso: false };
    }

    if (!motivo?.trim()) {
        return { sucesso: false };
    }

    const agora = new Date().toISOString();

    const historico = [
        atual.observacao,
        "[REABERTO_DAVI] " + agora +
        " | davi.smi" +
        " | Motivo: " + motivo.trim() +
        " | Contagem anterior: " + atual.quantidade_contada +
        " | Aprovado por: " + (atual.aprovado_por || "—") +
        " | Aprovado em: " + (atual.aprovado_em || "—")
    ].filter(Boolean).join("\n");

    let consulta = window.supabaseClient
        .from(NOME_TABELA_INVENTARIO)
        .update({
            situacao_aprovacao: "PENDENTE",
            aprovado_por: null,
            aprovado_em: null,
            atualizado_em: agora,
            observacao: historico
        })
        .eq("id", atual.id)
        .eq("situacao_aprovacao", atual.situacao_aprovacao);

    // Evita reabrir se o registro mudou após a consulta.
    if (atual.atualizado_em) {
        consulta = consulta.eq("atualizado_em", atual.atualizado_em);
    }

    const { data, error } = await consulta.select().single();

    if (error || !data) {
        alert(
            "A reabertura não foi concluída. " +
            "O item pode ter sido alterado; atualize a tela."
        );
        return { sucesso: false };
    }

    // O estoque só muda quando a contagem for aprovada novamente.
    return {
        sucesso: true,
        registro: data
    };
}

async function aprovarContagemInventarioSupabase(registroInventario) {
    if (!verificarConexaoInventarioSupabase()) {
        return { sucesso: false };
    }

    if (!registroInventario || !registroInventario.id) {
        alert("Registro do inventário não encontrado.");
        return { sucesso: false };
    }

    if (
        registroInventario.quantidade_contada === null ||
        registroInventario.quantidade_contada === undefined
    ) {
        alert("Digite a quantidade contada antes de aprovar.");
        return { sucesso: false };
    }

    const registroAtual = await buscarContagemProdutoSupabase(
        registroInventario.codigo,
        registroInventario.posicao
    );

    if (!registroAtual || registroAtual.id !== registroInventario.id) {
        return { sucesso: false };
    }

    registroInventario = registroAtual;

    if (
        contagemReservadaDavi(registroInventario) &&
        !podeReabrirInventario()
    ) {
        alert("Esta correção está reservada a davi.smi.");
        return { sucesso: false };
    }

    const situacaoAtual = String(
        registroInventario.situacao_aprovacao || "PENDENTE"
    ).trim().toUpperCase();

    if (situacaoAtual === "APROVADO") {
        alert("Este item já foi aprovado.");
        return { sucesso: false };
    }

    const codigo = normalizarTextoInventario(registroInventario.codigo);
    const posicao = normalizarTextoInventario(registroInventario.posicao);

    const quantidadeNova = converterNumeroInventarioSupabase(
        registroInventario.quantidade_contada
    );

    const { data: produtosEncontrados, error: erroBuscaProduto } =
        await window.supabaseClient
            .from(NOME_TABELA_PRODUTOS)
            .select("id, codigo, endereco, quantidade")
            .eq("codigo", codigo)
            .eq("endereco", posicao)
            .limit(1);

    if (erroBuscaProduto) {
        console.error(erroBuscaProduto);
        alert(
            "Não foi possível localizar o produto.\n\n" +
            erroBuscaProduto.message
        );
        return { sucesso: false };
    }

    if (
        !Array.isArray(produtosEncontrados) ||
        produtosEncontrados.length === 0
    ) {
        alert(
            "Produto não encontrado na tabela Produtos.\n\n" +
            "Código: " + codigo +
            "\nPosição: " + posicao
        );
        return { sucesso: false };
    }

    const produtoEncontrado = produtosEncontrados[0];

    const quantidadeAnterior = converterNumeroInventarioSupabase(
        produtoEncontrado.quantidade
    );

    const { error: erroAtualizacaoProduto } = await window.supabaseClient
        .from(NOME_TABELA_PRODUTOS)
        .update({ quantidade: quantidadeNova })
        .eq("id", produtoEncontrado.id);

    if (erroAtualizacaoProduto) {
        console.error(erroAtualizacaoProduto);
        alert(
            "Não foi possível ajustar o estoque.\n\n" +
            erroAtualizacaoProduto.message
        );
        return { sucesso: false };
    }

    const agora = new Date().toISOString();
    const usuarioAtual = obterUsuarioAtualInventario();

    const { data: inventarioAtualizado, error: erroInventario } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .update({
                situacao_aprovacao: "APROVADO",
                aprovado_por: usuarioAtual,
                aprovado_em: agora,
                observacao:
                    (
                        registroInventario.observacao
                            ? registroInventario.observacao + "\n"
                            : ""
                    ) +
                    "Estoque ajustado de " +
                    quantidadeAnterior +
                    " para " +
                    quantidadeNova,
                quantidade_sistema: quantidadeNova,
                diferenca: 0,
                status: "OK"
            })
            .eq("id", registroInventario.id)
            .select()
            .single();

    if (erroInventario) {
        console.error(erroInventario);
        alert(
            "O estoque foi atualizado, mas não foi possível " +
            "finalizar a aprovação.\n\n" +
            erroInventario.message
        );
        return { sucesso: false };
    }

    try {
        const estoqueLocal = JSON.parse(localStorage.getItem("estoque")) || [];

        if (Array.isArray(estoqueLocal)) {
            const indiceProduto = estoqueLocal.findIndex(function (produto) {
                return (
                    String(produto.codigo || "").trim() === codigo &&
                    String(produto.endereco || "").trim() === posicao
                );
            });

            if (indiceProduto >= 0) {
                estoqueLocal[indiceProduto].quantidade = quantidadeNova;
                localStorage.setItem("estoque", JSON.stringify(estoqueLocal));
            }
        }
    } catch (erroLocal) {
        console.warn(
            "Não foi possível atualizar o estoque local:",
            erroLocal
        );
    }

    return {
        sucesso: true,
        registro: inventarioAtualizado,
        quantidadeAnterior,
        quantidadeNova
    };
}

async function reprovarContagemInventarioSupabase(
    registroInventario,
    observacao
) {
    if (!verificarConexaoInventarioSupabase()) {
        return { sucesso: false };
    }

    if (!registroInventario || !registroInventario.id) {
        alert("Registro do inventário não encontrado.");
        return { sucesso: false };
    }

    const atual = await buscarContagemProdutoSupabase(
        registroInventario.codigo,
        registroInventario.posicao
    );

    if (!atual || atual.id !== registroInventario.id) {
        return { sucesso: false };
    }

    registroInventario = atual;

    if (
        String(atual.situacao_aprovacao).toUpperCase() === "APROVADO" ||
        (contagemReservadaDavi(atual) && !podeReabrirInventario())
    ) {
        alert(
            "Item bloqueado. " +
            "Somente davi.smi pode reabrir uma aprovação."
        );
        return { sucesso: false };
    }

    const { data, error } = await window.supabaseClient
        .from(NOME_TABELA_INVENTARIO)
        .update({
            situacao_aprovacao: "REPROVADO",
            aprovado_por: obterUsuarioAtualInventario(),
            aprovado_em: new Date().toISOString(),
            observacao:
                (
                    registroInventario.observacao
                        ? registroInventario.observacao + "\n"
                        : ""
                ) +
                (
                    normalizarTextoInventario(observacao) ||
                    "Contagem reprovada."
                )
        })
        .eq("id", registroInventario.id)
        .select()
        .single();

    if (error) {
        console.error(error);
        alert("Não foi possível reprovar a contagem.\n\n" + error.message);
        return {
            sucesso: false,
            erro: error
        };
    }

    return {
        sucesso: true,
        registro: data
    };
}

async function limparContagensInventarioSupabase() {
    if (!verificarConexaoInventarioSupabase()) {
        return false;
    }

    const { error } = await window.supabaseClient
        .from(NOME_TABELA_INVENTARIO)
        .update({
            quantidade_contada: null,
            diferenca: null,
            status: "PENDENTE",
            usuario: null,
            atualizado_em: new Date().toISOString(),
            situacao_aprovacao: "PENDENTE",
            aprovado_por: null,
            aprovado_em: null,
            observacao: null
        })
        .or(
            "situacao_aprovacao.is.null," +
            "situacao_aprovacao.neq.__LIMPAR_TODOS__"
        );

    if (error) {
        console.error(error);
        alert("Não foi possível limpar as contagens.\n\n" + error.message);
        return false;
    }

    return true;
}

function criarMapaContagensInventario(registros) {
    const mapa = {};

    if (!Array.isArray(registros)) {
        return mapa;
    }

    registros.forEach(function (registro) {
        const codigo =
            normalizarTextoInventario(registro.codigo).toUpperCase();

        const posicao =
            normalizarTextoInventario(registro.posicao).toUpperCase();

        const chave = codigo + "__" + posicao;
        const anterior = mapa[chave];

        const dataAtual = Date.parse(registro.atualizado_em || "") || 0;
        const dataAnterior = Date.parse(anterior?.atualizado_em || "") || 0;

        if (
            !anterior ||
            dataAtual > dataAnterior ||
            (
                dataAtual === dataAnterior &&
                String(registro.id).localeCompare(
                    String(anterior.id),
                    undefined,
                    { numeric: true }
                ) > 0
            )
        ) {
            mapa[chave] = registro;
        }
    });

    return mapa;
}

window.buscarProdutosInventarioSupabase = buscarProdutosInventarioSupabase;
window.buscarContagensInventarioSupabase = buscarContagensInventarioSupabase;
window.salvarContagemInventarioSupabase = salvarContagemInventarioSupabase;
window.limparContagensInventarioSupabase = limparContagensInventarioSupabase;
window.criarMapaContagensInventario = criarMapaContagensInventario;
window.aprovarContagemInventarioSupabase = aprovarContagemInventarioSupabase;
window.reprovarContagemInventarioSupabase = reprovarContagemInventarioSupabase;
window.podeReabrirInventario = podeReabrirInventario;
window.contagemReservadaDavi = contagemReservadaDavi;
window.reabrirContagemInventarioSupabase = reabrirContagemInventarioSupabase;

console.log("Inventário com aprovação e reabertura para davi.smi carregado.");