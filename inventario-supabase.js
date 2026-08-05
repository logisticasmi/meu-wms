// =====================================================
// SMI WMS - INVENTÁRIO COMPARTILHADO COM APROVAÇÃO
// =====================================================

const NOME_TABELA_INVENTARIO = "inventario";


// =====================================================
// VERIFICAR CONEXÃO
// =====================================================

function verificarConexaoInventarioSupabase() {
    if (
        !window.supabaseClient ||
        typeof window.supabaseClient.from !== "function"
    ) {
        console.error(
            "Supabase não foi carregado no Inventário."
        );

        alert(
            "Não foi possível conectar o Inventário ao banco online."
        );

        return false;
    }

    return true;
}


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTextoInventario(valor) {
    return String(valor || "").trim();
}


// =====================================================
// CONVERTER NÚMERO
// =====================================================

function converterNumeroInventarioSupabase(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return 0;
    }

    let texto = String(valor)
        .trim()
        .replace(/\s/g, "");

    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    texto = texto.replace(
        /[^0-9.-]/g,
        ""
    );

    const numero = Number(texto);

    return Number.isFinite(numero)
        ? numero
        : 0;
}


// =====================================================
// OBTER USUÁRIO ATUAL
// =====================================================

function obterUsuarioAtualInventario() {
    return (
        localStorage.getItem("usuario") ||
        localStorage.getItem("nomeUsuario") ||
        "Administrador"
    );
}


// =====================================================
// BUSCAR TODAS AS CONTAGENS
// =====================================================

async function buscarContagensInventarioSupabase() {
    if (!verificarConexaoInventarioSupabase()) {
        return [];
    }

    const { data, error } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .select("*")
            .order("posicao", {
                ascending: true
            })
            .order("codigo", {
                ascending: true
            });

    if (error) {
        console.error(
            "Erro ao buscar o Inventário:",
            error
        );

        alert(
            "Não foi possível carregar as contagens online.\n\n" +
            error.message
        );

        return [];
    }

    return Array.isArray(data)
        ? data
        : [];
}


// =====================================================
// BUSCAR UMA CONTAGEM
// =====================================================

async function buscarContagemProdutoSupabase(
    codigo,
    posicao
) {
    if (!verificarConexaoInventarioSupabase()) {
        return null;
    }

    const codigoLimpo =
        normalizarTextoInventario(codigo);

    const posicaoLimpa =
        normalizarTextoInventario(posicao);

    const { data, error } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .select("*")
            .eq("codigo", codigoLimpo)
            .eq("posicao", posicaoLimpa)
            .order("atualizado_em", {
                ascending: false
            })
            .limit(1);

    if (error) {
        console.error(
            "Erro ao buscar contagem do produto:",
            error
        );

        return null;
    }

    return (
        Array.isArray(data) &&
        data.length > 0
    )
        ? data[0]
        : null;
}


// =====================================================
// SALVAR OU ATUALIZAR CONTAGEM
// =====================================================

async function salvarContagemInventarioSupabase(
    produto,
    quantidadeContada
) {
    if (!verificarConexaoInventarioSupabase()) {
        return {
            sucesso: false
        };
    }

    const codigo =
        normalizarTextoInventario(
            produto.codigo
        );

    const descricao =
        normalizarTextoInventario(
            produto.descricao
        );

    const posicao =
        normalizarTextoInventario(
            produto.endereco ||
            produto.posicao
        );

    const quantidadeSistema =
        converterNumeroInventarioSupabase(
            produto.quantidade
        );

    const quantidadeContadaNumero =
        converterNumeroInventarioSupabase(
            quantidadeContada
        );

    if (codigo === "") {
        alert(
            "O produto não possui código para salvar a contagem."
        );

        return {
            sucesso: false
        };
    }

    const registroExistente =
        await buscarContagemProdutoSupabase(
            codigo,
            posicao
        );

    if (
        registroExistente &&
        String(
            registroExistente.situacao_aprovacao ||
            ""
        )
            .trim()
            .toUpperCase() === "APROVADO"
    ) {
        alert(
            "Este item já foi aprovado e não pode ser alterado."
        );

        return {
            sucesso: false
        };
    }

    const diferenca =
        quantidadeContadaNumero -
        quantidadeSistema;

    const status =
        diferenca === 0
            ? "OK"
            : "DIVERGENTE";

    const dadosInventario = {
        codigo: codigo,
        descricao: descricao,
        posicao: posicao,

        quantidade_sistema:
            quantidadeSistema,

        quantidade_contada:
            quantidadeContadaNumero,

        diferenca: diferenca,
        status: status,

        usuario:
            obterUsuarioAtualInventario(),

        atualizado_em:
            new Date().toISOString(),

        situacao_aprovacao:
            "PENDENTE",

        aprovado_por: null,
        aprovado_em: null,
        observacao: null
    };

    let resposta;

    if (
        registroExistente &&
        registroExistente.id
    ) {
        resposta =
            await window.supabaseClient
                .from(
                    NOME_TABELA_INVENTARIO
                )
                .update(dadosInventario)
                .eq(
                    "id",
                    registroExistente.id
                )
                .select()
                .single();

    } else {
        resposta =
            await window.supabaseClient
                .from(
                    NOME_TABELA_INVENTARIO
                )
                .insert([
                    dadosInventario
                ])
                .select()
                .single();
    }

    if (resposta.error) {
        console.error(
            "Erro ao salvar a contagem:",
            resposta.error
        );

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


// =====================================================
// LIMPAR CONTAGENS NÃO APROVADAS
// =====================================================

async function limparContagensInventarioSupabase() {
    if (!verificarConexaoInventarioSupabase()) {
        return false;
    }

    const { error } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .update({
                quantidade_contada: null,
                diferenca: null,
                status: "PENDENTE",
                usuario: null,

                atualizado_em:
                    new Date().toISOString(),

                situacao_aprovacao:
                    "PENDENTE",

                aprovado_por: null,
                aprovado_em: null,
                observacao: null
            })
            .neq(
                "situacao_aprovacao",
                "APROVADO"
            );

    if (error) {
        console.error(
            "Erro ao limpar as contagens:",
            error
        );

        alert(
            "Não foi possível limpar as contagens online.\n\n" +
            error.message
        );

        return false;
    }

    return true;
}


// =====================================================
// APROVAR CONTAGEM E AJUSTAR PRODUTO
// =====================================================

async function aprovarContagemInventarioSupabase(
    registroInventario
) {
    if (!verificarConexaoInventarioSupabase()) {
        return {
            sucesso: false
        };
    }

    if (
        !registroInventario ||
        !registroInventario.id
    ) {
        alert(
            "Registro do inventário não encontrado."
        );

        return {
            sucesso: false
        };
    }

    if (
        registroInventario.quantidade_contada === null ||
        registroInventario.quantidade_contada === undefined
    ) {
        alert(
            "Digite a quantidade contada antes de aprovar."
        );

        return {
            sucesso: false
        };
    }

    const situacaoAtual =
        String(
            registroInventario.situacao_aprovacao ||
            "PENDENTE"
        )
            .trim()
            .toUpperCase();

    if (situacaoAtual === "APROVADO") {
        alert(
            "Este item já foi aprovado."
        );

        return {
            sucesso: false
        };
    }

    const codigo =
        normalizarTextoInventario(
            registroInventario.codigo
        );

    const posicao =
        normalizarTextoInventario(
            registroInventario.posicao
        );

    const quantidadeNova =
        converterNumeroInventarioSupabase(
            registroInventario.quantidade_contada
        );

    /*
       Localiza o produto pelo código e posição.
    */

    const {
        data: produtosEncontrados,
        error: erroBuscaProduto
    } =
        await window.supabaseClient
            .from("produtos")
            .select(
                "id, codigo, endereco, quantidade"
            )
            .eq("codigo", codigo)
            .eq("endereco", posicao)
            .limit(1);

    if (erroBuscaProduto) {
        console.error(
            "Erro ao localizar produto:",
            erroBuscaProduto
        );

        alert(
            "Não foi possível localizar o produto no estoque.\n\n" +
            erroBuscaProduto.message
        );

        return {
            sucesso: false
        };
    }

    if (
        !Array.isArray(produtosEncontrados) ||
        produtosEncontrados.length === 0
    ) {
        alert(
            "Produto não encontrado na tabela Produtos.\n\n" +
            "Código: " +
            codigo +
            "\nPosição: " +
            posicao
        );

        return {
            sucesso: false
        };
    }

    const produtoEncontrado =
        produtosEncontrados[0];

    const quantidadeAnterior =
        converterNumeroInventarioSupabase(
            produtoEncontrado.quantidade
        );

    /*
       Atualiza a quantidade oficial do produto.
    */

    const { error: erroAtualizacaoProduto } =
        await window.supabaseClient
            .from("produtos")
            .update({
                quantidade:
                    quantidadeNova
            })
            .eq(
                "id",
                produtoEncontrado.id
            );

    if (erroAtualizacaoProduto) {
        console.error(
            "Erro ao atualizar o produto:",
            erroAtualizacaoProduto
        );

        alert(
            "Não foi possível ajustar o estoque do produto.\n\n" +
            erroAtualizacaoProduto.message
        );

        return {
            sucesso: false
        };
    }

    const agora =
        new Date().toISOString();

    const usuarioAtual =
        obterUsuarioAtualInventario();

    /*
       Marca o Inventário como aprovado.
    */

    const {
        data: inventarioAtualizado,
        error: erroInventario
    } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .update({
                situacao_aprovacao:
                    "APROVADO",

                aprovado_por:
                    usuarioAtual,

                aprovado_em:
                    agora,

                observacao:
                    "Estoque ajustado de " +
                    quantidadeAnterior +
                    " para " +
                    quantidadeNova,

                /*
                   Após a aprovação, a quantidade
                   oficial passa a ser a contada.
                */

                quantidade_sistema:
                    quantidadeNova,

                diferenca: 0,
                status: "OK"
            })
            .eq(
                "id",
                registroInventario.id
            )
            .select()
            .single();

    if (erroInventario) {
        console.error(
            "Estoque ajustado, mas houve erro ao finalizar a aprovação:",
            erroInventario
        );

        alert(
            "O estoque foi atualizado, mas não foi possível finalizar a aprovação.\n\n" +
            erroInventario.message
        );

        return {
            sucesso: false
        };
    }

    /*
       Atualiza também o estoque local
       do navegador que aprovou.
    */

    try {
        const estoqueLocal =
            JSON.parse(
                localStorage.getItem(
                    "estoque"
                )
            ) || [];

        if (Array.isArray(estoqueLocal)) {
            const indiceProduto =
                estoqueLocal.findIndex(
                    function (produto) {
                        return (
                            String(
                                produto.codigo ||
                                ""
                            ).trim() === codigo &&

                            String(
                                produto.endereco ||
                                ""
                            ).trim() === posicao
                        );
                    }
                );

            if (indiceProduto >= 0) {
                estoqueLocal[
                    indiceProduto
                ].quantidade =
                    quantidadeNova;

                localStorage.setItem(
                    "estoque",
                    JSON.stringify(
                        estoqueLocal
                    )
                );
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
        registro:
            inventarioAtualizado,
        quantidadeAnterior:
            quantidadeAnterior,
        quantidadeNova:
            quantidadeNova
    };
}


// =====================================================
// REPROVAR CONTAGEM
// =====================================================

async function reprovarContagemInventarioSupabase(
    registroInventario,
    observacao
) {
    if (!verificarConexaoInventarioSupabase()) {
        return {
            sucesso: false
        };
    }

    if (
        !registroInventario ||
        !registroInventario.id
    ) {
        alert(
            "Registro do inventário não encontrado."
        );

        return {
            sucesso: false
        };
    }

    const usuarioAtual =
        obterUsuarioAtualInventario();

    const agora =
        new Date().toISOString();

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(NOME_TABELA_INVENTARIO)
            .update({
                situacao_aprovacao:
                    "REPROVADO",

                aprovado_por:
                    usuarioAtual,

                aprovado_em:
                    agora,

                observacao:
                    normalizarTextoInventario(
                        observacao
                    ) ||
                    "Contagem reprovada."
            })
            .eq(
                "id",
                registroInventario.id
            )
            .select()
            .single();

    if (error) {
        console.error(
            "Erro ao reprovar o inventário:",
            error
        );

        alert(
            "Não foi possível reprovar a contagem.\n\n" +
            error.message
        );

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


// =====================================================
// CRIAR MAPA DAS CONTAGENS
// =====================================================

function criarMapaContagensInventario(
    registros
) {
    const mapa = {};

    if (!Array.isArray(registros)) {
        return mapa;
    }

    registros.forEach(
        function (registro) {
            const codigo =
                normalizarTextoInventario(
                    registro.codigo
                )
                    .toUpperCase();

            const posicao =
                normalizarTextoInventario(
                    registro.posicao
                )
                    .toUpperCase();

            const chave =
                codigo +
                "__" +
                posicao;

            mapa[chave] =
                registro;
        }
    );

    return mapa;
}


// =====================================================
// DISPONIBILIZAR FUNÇÕES PARA O HTML
// =====================================================

window.buscarContagensInventarioSupabase =
    buscarContagensInventarioSupabase;

window.salvarContagemInventarioSupabase =
    salvarContagemInventarioSupabase;

window.limparContagensInventarioSupabase =
    limparContagensInventarioSupabase;

window.criarMapaContagensInventario =
    criarMapaContagensInventario;

window.aprovarContagemInventarioSupabase =
    aprovarContagemInventarioSupabase;

window.reprovarContagemInventarioSupabase =
    reprovarContagemInventarioSupabase;

console.log(
    "Módulo de Inventário Supabase com aprovação carregado."
);