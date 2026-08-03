// =====================================================
// SMI WMS - DASHBOARD.JS
// =====================================================

let graficoMovimentacoesDashboard = null;
let graficoEstoqueDashboard = null;
let graficoTendenciaProdutos = null;
let graficoTendenciaQuantidade = null;
let graficoTendenciaValor = null;

// =====================================================
// INICIALIZAÇÃO DO DASHBOARD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    atualizarDashboardCompleto();

});


// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

function atualizarDashboardCompleto() {

    const estoque = obterEstoqueDashboard();
    const movimentacoes = obterMovimentacoesDashboard();

    atualizarCardsDashboard(estoque);
    criarGraficosTendenciaCards(
    estoque,
    movimentacoes
);

    criarGraficoMovimentacoes(movimentacoes);

    criarGraficoEstoqueCliente(estoque);

    carregarTopProdutos(estoque);

    carregarTopPosicoes(estoque);

    carregarResumoDoDia(movimentacoes);

    carregarUltimasMovimentacoes(movimentacoes);

}


// =====================================================
// CARREGAR DADOS DO LOCALSTORAGE
// =====================================================

function obterEstoqueDashboard() {

    try {

        return JSON.parse(
            localStorage.getItem("estoque")
        ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar o estoque:",
            erro
        );

        return [];

    }

}



function obterMovimentacoesDashboard() {

    function lerLista(chave) {
        try {
            const valor = localStorage.getItem(chave);

            if (!valor) {
                return [];
            }

            const dados = JSON.parse(valor);

            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            console.error(
                "Erro ao carregar a chave " + chave + ":",
                erro
            );

            return [];
        }
    }

    function prepararMovimento(movimento, tipoPadrao) {
        const registro =
            movimento && typeof movimento === "object"
                ? { ...movimento }
                : {};

        if (!registro.tipo && tipoPadrao) {
            registro.tipo = tipoPadrao;
        }

        registro.codigo =
            registro.codigo ||
            registro.sku ||
            registro.produto ||
            "";

        registro.descricao =
            registro.descricao ||
            registro.nomeProduto ||
            "";

        registro.quantidade =
            registro.quantidade ??
            registro.qtd ??
            registro.qtde ??
            0;

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
            localStorage.getItem("usuario") ||
            "Administrador";

        return registro;
    }

    const movimentacoes = lerLista("movimentacoes")
        .map(function (item) {
            return prepararMovimento(item, "");
        });

    const entradas = lerLista("entradas")
        .map(function (item) {
            return prepararMovimento(item, "ENTRADA");
        });

    const saidas = lerLista("saidas")
        .map(function (item) {
            return prepararMovimento(item, "SAIDA");
        });

    const transferencias = lerLista("transferencias")
        .map(function (item) {
            return prepararMovimento(
                item,
                "TRANSFERENCIA"
            );
        });

    const todos = [
        ...movimentacoes,
        ...entradas,
        ...saidas,
        ...transferencias
    ];

    const registrosUnicos = [];
    const assinaturas = new Set();

    todos.forEach(function (movimento) {
        const assinatura = [
            normalizarTipoMovimentacao(
                movimento.tipo
            ),
            String(movimento.codigo || "")
                .trim()
                .toUpperCase(),
            Number(movimento.quantidade || 0),
            String(movimento.data || "").trim(),
            String(
                movimento.origem ||
                movimento.endereco ||
                ""
            )
                .trim()
                .toUpperCase(),
            String(movimento.destino || "")
                .trim()
                .toUpperCase()
        ].join("|");

        if (!assinaturas.has(assinatura)) {
            assinaturas.add(assinatura);
            registrosUnicos.push(movimento);
        }
    });

    return registrosUnicos;
}


// =====================================================
// CARDS SUPERIORES
// =====================================================

function atualizarCardsDashboard(estoque) {

    const produtosValidos = estoque.filter(function (produto) {

        return produto && produto.codigo;

    });


    const codigosUnicos = new Set();

    produtosValidos.forEach(function (produto) {

        codigosUnicos.add(
            String(produto.codigo).trim()
        );

    });


    const totalProdutos = codigosUnicos.size;


    const quantidadeTotal = produtosValidos.reduce(
        function (total, produto) {

            return total +
                Number(produto.quantidade || 0);

        },
        0
    );


const valorTotal = produtosValidos.reduce(
    function (total, produto) {

        return total + Number(produto.valorTotal || 0);

    },
    0
);


    const posicoesUnicas = new Set();

    produtosValidos.forEach(function (produto) {

        if (produto.endereco) {

            posicoesUnicas.add(
                String(produto.endereco)
                    .trim()
                    .toUpperCase()
            );

        }

    });


    const totalPosicoes = posicoesUnicas.size;

    /*
      Conforme a configuração atual do seu WMS,
      foram considerados 360 níveis disponíveis.
    */

    const capacidadeTotal = 360;

    const percentualOcupacao =
        capacidadeTotal > 0
            ? (totalPosicoes / capacidadeTotal) * 100
            : 0;


    alterarTextoElemento(
        "cardProdutos",
        totalProdutos.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "cardQuantidade",
        quantidadeTotal.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "cardValor",
        valorTotal.toLocaleString("pt-BR", {

            style: "currency",
            currency: "BRL"

        })
    );


    alterarTextoElemento(
        "cardPosicoes",
        totalPosicoes.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "cardNiveis",
        percentualOcupacao.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }
        ) + "%"
    );
    // Atualiza as barras de progresso dos cards

const progressoPosicoes =
    document.getElementById("progressoPosicoes");

const progressoNiveis =
    document.getElementById("progressoNiveis");

const percentualLimitado =
    Math.min(percentualOcupacao, 100);

if (progressoPosicoes) {
    progressoPosicoes.style.width =
        percentualLimitado + "%";
}

if (progressoNiveis) {
    progressoNiveis.style.width =
        percentualLimitado + "%";
}

}


// =====================================================
// GRÁFICO: ENTRADAS X SAÍDAS
// =====================================================

function criarGraficoMovimentacoes(movimentacoes) {

    const canvas =
        document.getElementById(
            "graficoMovimentacoes"
        );

    if (!canvas || typeof Chart === "undefined") {

        return;

    }


    const ultimosDias =
        gerarUltimosSeteDias();


    const entradas =
        new Array(7).fill(0);


    const saidas =
        new Array(7).fill(0);


    movimentacoes.forEach(function (movimento) {

        const dataMovimento =
            converterDataDashboard(
                movimento.data
            );

        if (!dataMovimento) {

            return;

        }


        const chaveData =
            obterChaveData(dataMovimento);


        const indice =
            ultimosDias.findIndex(
                function (dia) {

                    return dia.chave === chaveData;

                }
            );


        if (indice === -1) {

            return;

        }


        const tipo =
            normalizarTipoMovimentacao(
                movimento.tipo
            );


        const quantidade =
            Number(
                movimento.quantidade || 0
            );


        if (tipo === "ENTRADA") {

            entradas[indice] += quantidade;

        }


        if (tipo === "SAIDA") {

            saidas[indice] += quantidade;

        }

    });


    if (graficoMovimentacoesDashboard) {

        graficoMovimentacoesDashboard.destroy();

    }


    graficoMovimentacoesDashboard =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: ultimosDias.map(
                        function (dia) {

                            return dia.rotulo;

                        }
                    ),

                    datasets: [

                        {
                            label: "Entradas",
                            data: entradas,
                            backgroundColor:
                                "rgba(22, 163, 74, 0.75)",
                            borderColor:
                                "rgba(22, 163, 74, 1)",
                            borderWidth: 1,
                            borderRadius: 7
                        },

                        {
                            label: "Saídas",
                            data: saidas,
                            backgroundColor:
                                "rgba(220, 38, 38, 0.75)",
                            borderColor:
                                "rgba(220, 38, 38, 1)",
                            borderWidth: 1,
                            borderRadius: 7
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false

                    },

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                usePointStyle: true,

                                padding: 20

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label: function (contexto) {

                                    return contexto.dataset.label +
                                        ": " +
                                        Number(
                                            contexto.raw || 0
                                        ).toLocaleString(
                                            "pt-BR"
                                        );

                                }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            },

                            grid: {

                                color:
                                    "rgba(0, 0, 0, 0.06)"

                            }

                        },

                        x: {

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// GRÁFICO: ESTOQUE POR CLIENTE
// =====================================================

function criarGraficoEstoqueCliente(estoque) {

    const canvas =
        document.getElementById(
            "graficoEstoque"
        );

    if (!canvas || typeof Chart === "undefined") {

        return;

    }


    const estoquePorCliente = {};


    estoque.forEach(function (produto) {

        if (!produto || !produto.codigo) {

            return;

        }


        const cliente =
            String(
                produto.cliente ||
                "Sem cliente informado"
            ).trim();


        const quantidade =
            Number(
                produto.quantidade || 0
            );


        if (!estoquePorCliente[cliente]) {

            estoquePorCliente[cliente] = 0;

        }


        estoquePorCliente[cliente] += quantidade;

    });


    let dadosOrdenados =
        Object.entries(estoquePorCliente)
            .sort(function (a, b) {

                return b[1] - a[1];

            });


    /*
      Mantém os cinco principais clientes.
      Os demais são agrupados em "Outros".
    */

    if (dadosOrdenados.length > 5) {

        const principais =
            dadosOrdenados.slice(0, 5);


        const totalOutros =
            dadosOrdenados
                .slice(5)
                .reduce(
                    function (total, item) {

                        return total + item[1];

                    },
                    0
                );


        principais.push([
            "Outros",
            totalOutros
        ]);


        dadosOrdenados = principais;

    }


    if (dadosOrdenados.length === 0) {

        dadosOrdenados = [
            ["Sem estoque", 1]
        ];

    }


    const cores = [

        "rgba(37, 99, 235, 0.85)",

        "rgba(22, 163, 74, 0.85)",

        "rgba(245, 158, 11, 0.85)",

        "rgba(147, 51, 234, 0.85)",

        "rgba(6, 182, 212, 0.85)",

        "rgba(107, 114, 128, 0.85)"

    ];


    if (graficoEstoqueDashboard) {

        graficoEstoqueDashboard.destroy();

    }


    graficoEstoqueDashboard =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: dadosOrdenados.map(
                        function (item) {

                            return item[0];

                        }
                    ),

                    datasets: [

                        {
                            data: dadosOrdenados.map(
                                function (item) {

                                    return item[1];

                                }
                            ),

                            backgroundColor: cores,

                            borderColor: "#ffffff",

                            borderWidth: 4,

                            hoverOffset: 8

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "65%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                usePointStyle: true,

                                padding: 18,

                                boxWidth: 10

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label: function (contexto) {

                                    const valor =
                                        Number(
                                            contexto.raw || 0
                                        );

                                    return contexto.label +
                                        ": " +
                                        valor.toLocaleString(
                                            "pt-BR"
                                        ) +
                                        " unidades";

                                }

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// TOP 5 PRODUTOS
// =====================================================

function carregarTopProdutos(estoque) {

    const container =
        document.getElementById(
            "topProdutos"
        );

    if (!container) {

        return;

    }


    const produtosAgrupados = {};


    estoque.forEach(function (produto) {

        if (!produto || !produto.codigo) {

            return;

        }


        const codigo =
            String(produto.codigo).trim();


        if (!produtosAgrupados[codigo]) {

            produtosAgrupados[codigo] = {

                codigo: codigo,

                descricao:
                    produto.descricao ||
                    "Produto sem descrição",

                quantidade: 0

            };

        }


        produtosAgrupados[codigo].quantidade +=
            Number(produto.quantidade || 0);

    });


    const produtos =
        Object.values(produtosAgrupados)
            .sort(function (a, b) {

                return b.quantidade -
                    a.quantidade;

            })
            .slice(0, 5);


    if (produtos.length === 0) {

        container.innerHTML = `

            <div class="dashboard-vazio">

                Nenhum produto cadastrado.

            </div>

        `;

        return;

    }


    const maiorQuantidade =
        produtos[0].quantidade || 1;


    container.innerHTML = "";


    produtos.forEach(
        function (produto, indice) {

            const percentual =
                Math.max(
                    5,
                    (
                        produto.quantidade /
                        maiorQuantidade
                    ) * 100
                );


            const item =
                document.createElement("div");


            item.className =
                "dashboard-ranking-item";


            item.innerHTML = `

                <div class="dashboard-ranking-cabecalho">

                    <div class="dashboard-ranking-identificacao">

                        <span class="dashboard-ranking-numero">

                            ${indice + 1}

                        </span>

                        <div>

                            <strong>

                                ${escaparHTML(
                                    produto.descricao
                                )}

                            </strong>

                            <small>

                                Código:
                                ${escaparHTML(
                                    produto.codigo
                                )}

                            </small>

                        </div>

                    </div>

                    <strong class="dashboard-ranking-valor">

                        ${produto.quantidade.toLocaleString(
                            "pt-BR"
                        )}

                    </strong>

                </div>

                <div class="dashboard-barra">

                    <div
                        class="dashboard-barra-preenchimento"
                        style="width:${percentual}%">

                    </div>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


// =====================================================
// TOP 5 POSIÇÕES
// =====================================================

function carregarTopPosicoes(estoque) {

    const container =
        document.getElementById(
            "topPosicoes"
        );

    if (!container) {

        return;

    }


    const posicoes = {};


    estoque.forEach(function (produto) {

        if (!produto || !produto.endereco) {

            return;

        }


        const endereco =
            String(produto.endereco)
                .trim()
                .toUpperCase();


        if (!posicoes[endereco]) {

            posicoes[endereco] = {

                endereco: endereco,

                quantidade: 0,

                produtos: new Set()

            };

        }


        posicoes[endereco].quantidade +=
            Number(produto.quantidade || 0);


        if (produto.codigo) {

            posicoes[endereco].produtos.add(
                String(produto.codigo)
            );

        }

    });


    const ranking =
        Object.values(posicoes)
            .sort(function (a, b) {

                return b.quantidade -
                    a.quantidade;

            })
            .slice(0, 5);


    if (ranking.length === 0) {

        container.innerHTML = `

            <div class="dashboard-vazio">

                Nenhuma posição ocupada.

            </div>

        `;

        return;

    }


    const maiorQuantidade =
        ranking[0].quantidade || 1;


    container.innerHTML = "";


    ranking.forEach(
        function (posicao, indice) {

            const percentual =
                Math.max(
                    5,
                    (
                        posicao.quantidade /
                        maiorQuantidade
                    ) * 100
                );


            const item =
                document.createElement("div");


            item.className =
                "dashboard-ranking-item";


            item.innerHTML = `

                <div class="dashboard-ranking-cabecalho">

                    <div class="dashboard-ranking-identificacao">

                        <span class="dashboard-ranking-numero">

                            ${indice + 1}

                        </span>

                        <div>

                            <strong>

                                Posição
                                ${escaparHTML(
                                    posicao.endereco
                                )}

                            </strong>

                            <small>

                                ${posicao.produtos.size}
                                SKU(s)

                            </small>

                        </div>

                    </div>

                    <strong class="dashboard-ranking-valor">

                        ${posicao.quantidade.toLocaleString(
                            "pt-BR"
                        )}

                    </strong>

                </div>

                <div class="dashboard-barra">

                    <div
                        class="dashboard-barra-preenchimento dashboard-barra-posicao"
                        style="width:${percentual}%">

                    </div>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


// =====================================================
// RESUMO DAS MOVIMENTAÇÕES DO DIA
// =====================================================

function carregarResumoDoDia(movimentacoes) {

    const hoje =
        obterChaveData(
            new Date()
        );


    let entradas = 0;
    let saidas = 0;
    let transferencias = 0;


    movimentacoes.forEach(function (movimento) {

        const data =
            converterDataDashboard(
                movimento.data
            );


        if (!data) {

            return;

        }


        if (obterChaveData(data) !== hoje) {

            return;

        }


        const tipo =
            normalizarTipoMovimentacao(
                movimento.tipo
            );


        const quantidade =
            Number(
                movimento.quantidade || 0
            );


        if (tipo === "ENTRADA") {

            entradas += quantidade;

        }


        if (tipo === "SAIDA") {

            saidas += quantidade;

        }


        if (tipo === "TRANSFERENCIA") {

            /*
              A transferência não altera o saldo,
              mas conta como movimentação operacional.
            */

            transferencias +=
                quantidade > 0
                    ? quantidade
                    : 1;

        }

    });


    const saldo = entradas - saidas;


    alterarTextoElemento(
        "resumoEntradas",
        entradas.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "resumoSaidas",
        saidas.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "resumoTransferencias",
        transferencias.toLocaleString("pt-BR")
    );


    alterarTextoElemento(
        "resumoSaldo",
        saldo.toLocaleString("pt-BR")
    );

}


// =====================================================
// ÚLTIMAS MOVIMENTAÇÕES
// =====================================================

function carregarUltimasMovimentacoes(
    movimentacoes
) {

    const tabela =
        document.getElementById(
            "ultimasMovimentacoes"
        );

    if (!tabela) {

        return;

    }


    if (movimentacoes.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="dashboard-sem-registro">

                    Nenhuma movimentação registrada.

                </td>

            </tr>

        `;

        return;

    }


    const movimentosOrdenados =
        movimentacoes
            .map(function (movimento, indice) {

                return {

                    movimento: movimento,

                    indiceOriginal: indice,

                    dataConvertida:
                        converterDataDashboard(
                            movimento.data
                        )

                };

            })
            .sort(function (a, b) {

                const dataA =
                    a.dataConvertida
                        ? a.dataConvertida.getTime()
                        : a.indiceOriginal;


                const dataB =
                    b.dataConvertida
                        ? b.dataConvertida.getTime()
                        : b.indiceOriginal;


                return dataB - dataA;

            })
            .slice(0, 8);


    tabela.innerHTML = "";


    movimentosOrdenados.forEach(
        function (registro) {

            const movimento =
                registro.movimento;


            const tipo =
                normalizarTipoMovimentacao(
                    movimento.tipo
                );


            const classeTipo =
                obterClasseTipo(tipo);


            const textoTipo =
                obterTextoTipo(tipo);


            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>

                    <span class="movimentacao-status ${classeTipo}">

                        ${textoTipo}

                    </span>

                </td>

                <td>

                    ${escaparHTML(
                        movimento.codigo || "-"
                    )}

                </td>

                <td>

                    ${escaparHTML(
                        movimento.descricao || "-"
                    )}

                </td>

                <td>

                    ${Number(
                        movimento.quantidade || 0
                    ).toLocaleString("pt-BR")}

                </td>

                <td>

                    ${escaparHTML(
                        movimento.origem ||
                        movimento.endereco ||
                        "-"
                    )}

                </td>

                <td>

                    ${escaparHTML(
                        movimento.destino ||
                        movimento.endereco ||
                        "-"
                    )}

                </td>

                <td>

                    ${escaparHTML(
                        formatarDataMovimentacao(
                            movimento.data
                        )
                    )}

                </td>

                <td>

                    ${escaparHTML(
                        movimento.operador ||
                        localStorage.getItem(
                            "usuario"
                        ) ||
                        "Administrador"
                    )}

                </td>

            `;


            tabela.appendChild(linha);

        }
    );

}


// =====================================================
// DATAS DOS ÚLTIMOS SETE DIAS
// =====================================================

function gerarUltimosSeteDias() {

    const dias = [];


    for (let indice = 6; indice >= 0; indice--) {

        const data = new Date();

        data.setHours(0, 0, 0, 0);

        data.setDate(
            data.getDate() - indice
        );


        dias.push({

            chave:
                obterChaveData(data),

            rotulo:
                data.toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit"
                    }
                )

        });

    }


    return dias;

}


// =====================================================
// CONVERSÃO E FORMATAÇÃO DE DATAS
// =====================================================

function converterDataDashboard(valor) {

    if (!valor) {

        return null;

    }


    if (valor instanceof Date) {

        return isNaN(valor.getTime())
            ? null
            : valor;

    }


    const texto =
        String(valor).trim();


    /*
      Formato brasileiro:
      03/08/2026 14:30:00
    */

    const formatoBrasileiro =
        texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
        );


    if (formatoBrasileiro) {

        const dia =
            Number(formatoBrasileiro[1]);

        const mes =
            Number(formatoBrasileiro[2]) - 1;

        const ano =
            Number(formatoBrasileiro[3]);

        const hora =
            Number(formatoBrasileiro[4] || 0);

        const minuto =
            Number(formatoBrasileiro[5] || 0);

        const segundo =
            Number(formatoBrasileiro[6] || 0);


        const data =
            new Date(
                ano,
                mes,
                dia,
                hora,
                minuto,
                segundo
            );


        return isNaN(data.getTime())
            ? null
            : data;

    }


    const dataPadrao =
        new Date(texto);


    return isNaN(dataPadrao.getTime())
        ? null
        : dataPadrao;

}


function obterChaveData(data) {

    const ano =
        data.getFullYear();


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


function formatarDataMovimentacao(valor) {

    const data =
        converterDataDashboard(valor);


    if (!data) {

        return valor || "-";

    }


    return data.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================================
// NORMALIZAR TIPOS DE MOVIMENTAÇÃO
// =====================================================

function normalizarTipoMovimentacao(tipo) {

    const texto =
        String(tipo || "")
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );


    if (texto.includes("ENTRADA")) {

        return "ENTRADA";

    }


    if (texto.includes("SAIDA")) {

        return "SAIDA";

    }


    if (
        texto.includes("TRANSFERENCIA") ||
        texto.includes("TRANSFERIR")
    ) {

        return "TRANSFERENCIA";

    }


    return texto || "MOVIMENTACAO";

}


function obterClasseTipo(tipo) {

    if (tipo === "ENTRADA") {

        return "movimentacao-entrada";

    }


    if (tipo === "SAIDA") {

        return "movimentacao-saida";

    }


    if (tipo === "TRANSFERENCIA") {

        return "movimentacao-transferencia";

    }


    return "movimentacao-outros";

}


function obterTextoTipo(tipo) {

    if (tipo === "ENTRADA") {

        return "Entrada";

    }


    if (tipo === "SAIDA") {

        return "Saída";

    }


    if (tipo === "TRANSFERENCIA") {

        return "Transferência";

    }


    return "Movimentação";

}


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function alterarTextoElemento(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent = texto;

    }

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================================

window.addEventListener(
    "storage",
    function (evento) {

       if (
    evento.key === "estoque" ||
    evento.key === "movimentacoes" ||
    evento.key === "entradas" ||
    evento.key === "saidas" ||
    evento.key === "transferencias"
) {

            atualizarDashboardCompleto();

        }

    }
);
// =====================================================
// MINI GRÁFICOS DE TENDÊNCIA DOS CARDS
// =====================================================

function criarGraficosTendenciaCards(
    estoque,
    movimentacoes
) {

    if (typeof Chart === "undefined") {
        return;
    }

    const ultimosDias =
        gerarUltimosSeteDias();

    const atividadeProdutos =
        new Array(7).fill(0);

    const quantidadeMovimentada =
        new Array(7).fill(0);

    const valorMovimentado =
        new Array(7).fill(0);


    movimentacoes.forEach(function (movimento) {

        const data =
            converterDataDashboard(
                movimento.data
            );

        if (!data) {
            return;
        }

        const chave =
            obterChaveData(data);

        const indice =
            ultimosDias.findIndex(
                function (dia) {
                    return dia.chave === chave;
                }
            );

        if (indice === -1) {
            return;
        }

        const quantidade =
            Number(
                movimento.quantidade || 0
            );

        atividadeProdutos[indice] += 1;

        quantidadeMovimentada[indice] +=
            quantidade;

        const produto =
            estoque.find(
                function (item) {

                    return String(
                        item.codigo || ""
                    ).trim() === String(
                        movimento.codigo || ""
                    ).trim();

                }
            );

        const valorUnitario =
            produto
                ? Number(produto.valor || 0)
                : 0;

        valorMovimentado[indice] +=
            quantidade * valorUnitario;

    });


    /*
      Quando não existem movimentações,
      exibe uma linha suave apenas para
      manter o visual do card.
    */

    const totalAtividade =
        atividadeProdutos.reduce(
            function (total, valor) {
                return total + valor;
            },
            0
        );

    if (totalAtividade === 0) {

        atividadeProdutos.splice(
            0,
            7,
            0,
            1,
            1,
            2,
            2,
            3,
            4
        );

        quantidadeMovimentada.splice(
            0,
            7,
            0,
            2,
            1,
            3,
            2,
            4,
            5
        );

        valorMovimentado.splice(
            0,
            7,
            0,
            1,
            2,
            2,
            3,
            4,
            6
        );

    }


    graficoTendenciaProdutos =
        criarMiniGrafico(
            "tendenciaProdutos",
            atividadeProdutos,
            "#1264e8",
            "rgba(18, 100, 232, 0.10)",
            graficoTendenciaProdutos
        );


    graficoTendenciaQuantidade =
        criarMiniGrafico(
            "tendenciaQuantidade",
            quantidadeMovimentada,
            "#0ba84f",
            "rgba(11, 168, 79, 0.10)",
            graficoTendenciaQuantidade
        );


    graficoTendenciaValor =
        criarMiniGrafico(
            "tendenciaValor",
            valorMovimentado,
            "#ff9200",
            "rgba(255, 146, 0, 0.10)",
            graficoTendenciaValor
        );

}


// =====================================================
// CRIAR UM MINI GRÁFICO
// =====================================================

function criarMiniGrafico(
    idCanvas,
    dados,
    corLinha,
    corFundo,
    graficoExistente
) {

    const canvas =
        document.getElementById(
            idCanvas
        );

    if (!canvas) {
        return graficoExistente;
    }

    if (graficoExistente) {
        graficoExistente.destroy();
    }

    return new Chart(
        canvas,
        {
            type: "line",

            data: {

                labels: [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7"
                ],

                datasets: [
                    {
                        data: dados,
                        borderColor: corLinha,
                        backgroundColor: corFundo,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: 700
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: false
                    }

                },

                scales: {

                    x: {
                        display: false
                    },

                    y: {
                        display: false,
                        beginAtZero: true
                    }

                },

                elements: {

                    line: {
                        capBezierPoints: true
                    }

                }

            }

        }
    );

}