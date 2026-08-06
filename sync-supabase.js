// =====================================================
// SMI WMS - SINCRONIZAÇÃO ENTRE USUÁRIOS
// =====================================================

// VERSÃO CORRIGIDA ONLINE - 20260806-1620

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
    const INTERVALO_ATUALIZACAO = 3000;

    const setItemOriginal =
        Storage.prototype.setItem;

    const removeItemOriginal =
        Storage.prototype.removeItem;

    let aplicandoDadosDoBanco = false;
    let envioAgendado = null;
    let ultimaAtualizacao = "";
    let buscaEmAndamento = false;


    function obterClienteSupabase() {
        return window.supabaseClient || null;
    }


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

                    if (valorAtual !== novoValor) {
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
    }


    function agendarEnvioParaBanco() {
        if (aplicandoDadosDoBanco) {
            return;
        }

        clearTimeout(envioAgendado);

        envioAgendado = setTimeout(
            enviarDadosParaBanco,
            350
        );
    }


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

        if (
            typeof window.carregarTabelaProdutosSupabase ===
            "function"
        ) {
            window.carregarTabelaProdutosSupabase();
        }
    }


    async function buscarDadosDoBanco() {
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

            const { data, error } =
                await supabase
                    .from("wms_state")
                    .select(
                        "data, updated_at"
                    )
                    .eq("id", ID_ESTADO)
                    .maybeSingle();

            if (error) {
                console.error(
                    "Erro ao buscar dados:",
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

            if (
                !data.updated_at ||
                data.updated_at ===
                    ultimaAtualizacao
            ) {
                return;
            }

            const houveAlteracao =
                aplicarDadosDoBanco(
                    data.data || {}
                );

            ultimaAtualizacao =
                data.updated_at;

            mostrarStatusSincronizacao(
                "Atualizado"
            );

            if (houveAlteracao) {
                atualizarTelasDepoisDaSincronizacao();
            }

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


    window.addEventListener(
        "load",
        function () {
            buscarDadosDoBanco();

            setInterval(
                buscarDadosDoBanco,
                INTERVALO_ATUALIZACAO
            );
        }
    );

})();