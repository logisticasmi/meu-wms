// =====================================================
// SMI WMS - SINCRONIZAÇÃO ENTRE USUÁRIOS
// VERSÃO ECONÔMICA - REDUÇÃO DE EGRESS SUPABASE
// =====================================================

(function () {
    "use strict";

    const CHAVES_COMPARTILHADAS = [
        "estoque",
        "movimentacoes",
        "entradas",
        "saidas",
        "transferencias",
        "posicoes",
        "configuracoes"
    ];

    const ID_ESTADO = "global";

    // Antes: 3000 ms
    // Agora verificamos somente o horário da última alteração.
    const INTERVALO_ATUALIZACAO = 15000;

    const setItemOriginal =
        Storage.prototype.setItem;

    const removeItemOriginal =
        Storage.prototype.removeItem;

    let aplicandoDadosDoBanco = false;

    let envioAgendado = null;

    let ultimaAtualizacao = "";

    let buscaEmAndamento = false;

    let primeiraCargaConcluida = false;


    // =====================================================
    // CLIENTE SUPABASE
    // =====================================================

    function obterClienteSupabase() {

        return window.supabaseClient || null;

    }


    // =====================================================
    // COLETAR DADOS LOCAIS
    // =====================================================

    function coletarDadosDoNavegador() {

        const dados = {};

        CHAVES_COMPARTILHADAS.forEach(
            function (chave) {

                const valor =
                    localStorage.getItem(chave);

                if (valor === null) {
                    return;
                }

                try {

                    dados[chave] =
                        JSON.parse(valor);

                } catch (erro) {

                    dados[chave] = valor;

                }

            }
        );

        return dados;

    }


    // =====================================================
    // APLICAR DADOS RECEBIDOS
    // =====================================================

    function aplicarDadosDoBanco(dados) {

        if (
            !dados ||
            typeof dados !== "object"
        ) {
            return false;
        }

        let houveAlteracao = false;

        aplicandoDadosDoBanco = true;

        try {

            CHAVES_COMPARTILHADAS.forEach(
                function (chave) {

                    if (
                        !Object.prototype
                            .hasOwnProperty.call(
                                dados,
                                chave
                            )
                    ) {
                        return;
                    }

                    const novoValor =
                        JSON.stringify(
                            dados[chave]
                        );

                    const valorAtual =
                        localStorage.getItem(
                            chave
                        );

                    if (
                        valorAtual !== novoValor
                    ) {

                        setItemOriginal.call(
                            localStorage,
                            chave,
                            novoValor
                        );

                        houveAlteracao = true;

                    }

                }
            );

        } finally {

            aplicandoDadosDoBanco = false;

        }

        return houveAlteracao;

    }


    // =====================================================
    // ENVIAR DADOS
    // =====================================================

    async function enviarDadosParaBanco() {

        const supabase =
            obterClienteSupabase();

        if (!supabase) {

            mostrarStatusSincronizacao(
                "Sem conexão"
            );

            return;

        }

        const dados =
            coletarDadosDoNavegador();

        const agora =
            new Date().toISOString();

        try {

            const { error } =
                await supabase
                    .from("wms_state")
                    .upsert(
                        {
                            id: ID_ESTADO,
                            data: dados,
                            updated_at: agora
                        },
                        {
                            onConflict: "id"
                        }
                    );

            if (error) {

                console.error(
                    "Erro ao enviar dados:",
                    error
                );

                mostrarStatusSincronizacao(
                    "Erro ao enviar"
                );

                return;

            }

            ultimaAtualizacao = agora;

            mostrarStatusSincronizacao(
                "Sincronizado"
            );

        } catch (erro) {

            console.error(
                "Erro inesperado ao enviar:",
                erro
            );

            mostrarStatusSincronizacao(
                "Erro ao enviar"
            );

        }

    }


    // =====================================================
    // AGENDAR ENVIO
    // =====================================================

    function agendarEnvioParaBanco() {

        if (aplicandoDadosDoBanco) {
            return;
        }

        clearTimeout(
            envioAgendado
        );

        // Antes 350 ms.
        // Dá tempo para várias alterações serem
        // agrupadas em um único envio.
        envioAgendado =
            setTimeout(
                enviarDadosParaBanco,
                1500
            );

    }


    // =====================================================
    // ATUALIZAR TELAS
    // =====================================================

    function atualizarTelasDepoisDaSincronizacao() {

        if (
            typeof window.atualizarDashboard ===
            "function"
        ) {

            window.atualizarDashboard();

        }

        if (
            typeof window.atualizarResumoMovimentacoes ===
            "function"
        ) {

            window.atualizarResumoMovimentacoes();

        }

        if (
            typeof window.carregarUltimasMovimentacoes ===
            "function"
        ) {

            window.carregarUltimasMovimentacoes();

        }

        if (
            typeof window.carregarHistoricoEntradas ===
            "function"
        ) {

            window.carregarHistoricoEntradas();

        }

        if (
            typeof window.carregarHistoricoSaidas ===
            "function"
        ) {

            window.carregarHistoricoSaidas();

        }

        if (
            typeof window.carregarHistoricoTransferencias ===
            "function"
        ) {

            window.carregarHistoricoTransferencias();

        }

        /*
        =====================================================
        IMPORTANTE
        =====================================================

        NÃO recarregar a tabela inteira de produtos
        sempre que o wms_state mudar.

        Antes havia:

        window.carregarTabelaProdutosSupabase();

        Isso podia disparar a leitura de milhares de
        produtos repetidamente.
        */

    }


    // =====================================================
    // BAIXAR ESTADO COMPLETO
    // SOMENTE QUANDO HOUVER ALTERAÇÃO
    // =====================================================

    async function baixarEstadoCompleto() {

        const supabase =
            obterClienteSupabase();

        if (!supabase) {
            return;
        }

        const { data, error } =
            await supabase
                .from("wms_state")
                .select(
                    "data, updated_at"
                )
                .eq(
                    "id",
                    ID_ESTADO
                )
                .maybeSingle();

        if (error) {

            console.error(
                "Erro ao baixar estado:",
                error
            );

            mostrarStatusSincronizacao(
                "Erro de sincronização"
            );

            return;

        }

        // Banco vazio
        if (!data) {

            await enviarDadosParaBanco();

            primeiraCargaConcluida = true;

            return;

        }

        const houveAlteracao =
            aplicarDadosDoBanco(
                data.data || {}
            );

        ultimaAtualizacao =
            data.updated_at || "";

        primeiraCargaConcluida = true;

        mostrarStatusSincronizacao(
            "Atualizado"
        );

        if (houveAlteracao) {

            atualizarTelasDepoisDaSincronizacao();

        }

    }


    // =====================================================
    // CONSULTA ECONÔMICA
    // BAIXA SOMENTE updated_at
    // =====================================================

    async function verificarAtualizacaoBanco() {

        if (buscaEmAndamento) {
            return;
        }

        buscaEmAndamento = true;

        try {

            const supabase =
                obterClienteSupabase();

            if (!supabase) {

                mostrarStatusSincronizacao(
                    "Sem conexão"
                );

                return;

            }

            // PRIMEIRA CARGA
            if (!primeiraCargaConcluida) {

                await baixarEstadoCompleto();

                return;

            }

            /*
            =================================================
            AQUI ESTÁ A PRINCIPAL ECONOMIA
            =================================================

            Antes:
                select("data, updated_at")

            Agora:
                select("updated_at")

            Portanto NÃO baixamos estoque,
            movimentações etc. a cada verificação.
            */

            const { data, error } =
                await supabase
                    .from("wms_state")
                    .select(
                        "updated_at"
                    )
                    .eq(
                        "id",
                        ID_ESTADO
                    )
                    .maybeSingle();

            if (error) {

                console.error(
                    "Erro ao verificar atualização:",
                    error
                );

                mostrarStatusSincronizacao(
                    "Erro de sincronização"
                );

                return;

            }

            if (!data) {

                await enviarDadosParaBanco();

                return;

            }

            const atualizacaoBanco =
                data.updated_at || "";

            // Nada mudou.
            // NÃO baixa os dados.
            if (
                atualizacaoBanco ===
                ultimaAtualizacao
            ) {

                mostrarStatusSincronizacao(
                    "Atualizado"
                );

                return;

            }

            // Algo mudou.
            // Só agora baixamos o estado completo.
            await baixarEstadoCompleto();

        } catch (erro) {

            console.error(
                "Erro inesperado na sincronização:",
                erro
            );

            mostrarStatusSincronizacao(
                "Erro de sincronização"
            );

        } finally {

            buscaEmAndamento = false;

        }

    }


    // =====================================================
    // STATUS
    // =====================================================

    function mostrarStatusSincronizacao(
        texto
    ) {

        let elemento =
            document.getElementById(
                "wmsSyncStatus"
            );

        if (!elemento) {

            elemento =
                document.createElement(
                    "div"
                );

            elemento.id =
                "wmsSyncStatus";

            elemento.style.cssText =
                "position:fixed;" +
                "right:12px;" +
                "bottom:12px;" +
                "z-index:99999;" +
                "background:#063b73;" +
                "color:#fff;" +
                "padding:7px 10px;" +
                "border-radius:8px;" +
                "font:12px Arial;" +
                "box-shadow:0 3px 12px rgba(0,0,0,.2);";

            if (document.body) {

                document.body.appendChild(
                    elemento
                );

            }

        }

        elemento.textContent =
            "☁ " + texto;

    }


    // =====================================================
    // INTERCEPTAR ALTERAÇÕES LOCAIS
    // =====================================================

    Storage.prototype.setItem =
        function (chave, valor) {

            setItemOriginal.call(
                this,
                chave,
                valor
            );

            if (
                this === localStorage &&
                CHAVES_COMPARTILHADAS
                    .includes(chave)
            ) {

                agendarEnvioParaBanco();

            }

        };


    Storage.prototype.removeItem =
        function (chave) {

            removeItemOriginal.call(
                this,
                chave
            );

            if (
                this === localStorage &&
                CHAVES_COMPARTILHADAS
                    .includes(chave)
            ) {

                agendarEnvioParaBanco();

            }

        };


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    window.addEventListener(
        "load",
        function () {

            verificarAtualizacaoBanco();

            setInterval(
                verificarAtualizacaoBanco,
                INTERVALO_ATUALIZACAO
            );

        }
    );


    // Quando o operador volta para a aba,
    // verifica imediatamente se algo mudou.
    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                verificarAtualizacaoBanco();

            }

        }
    );

})();