// =========================
// CARREGAR ESTOQUE
// =========================

function carregarEstoque() {

    const tabela = document.getElementById("listaProdutos");

    if (!tabela) return;

    tabela.innerHTML = "";

    let estoque = JSON.parse(localStorage.getItem("estoque")) || [];

    estoque.forEach(function(produto, indice){

        if (!produto.codigo) return;

        tabela.innerHTML += `
        <tr>


            <td>${produto.codigo || ""}</td>

            <td>${produto.descricao || ""}</td>

            <td>${produto.cliente || ""}</td>

            <td>${produto.quantidade || 0}</td>

            <td>
                <a href="posicoes.html?posicao=${produto.endereco}">
                    ${produto.endereco || ""}
                </a>
            </td>

            <td>
                <span class="status-ativo">Ativo</span>
            </td>

            <td>

                <button class="btn-editar"
                    onclick="editarEstoque(${indice})">
                    ✏ Editar
                </button>

                <button class="btn-excluir"
                    onclick="excluirEstoque(${indice})">
                    🗑 Excluir
                </button>

            </td>

        </tr>
        `;

    });

}

// =========================
// EXCLUIR
// =========================

function excluirEstoque(indice){

    let estoque = JSON.parse(localStorage.getItem("estoque")) || [];

    estoque.splice(indice,1);

    localStorage.setItem("estoque", JSON.stringify(estoque));

    carregarEstoque();

}

// =========================
// EDITAR
// =========================

function editarEstoque(indice){

    let estoque = JSON.parse(localStorage.getItem("estoque")) || [];

    let produto = estoque[indice];

    if(document.getElementById("nf")){
        document.getElementById("nf").value = produto.nf || "";
    }

    document.getElementById("codigo").value = produto.codigo || "";
    document.getElementById("descricao").value = produto.descricao || "";
    document.getElementById("cliente").value = produto.cliente || "";
    document.getElementById("quantidade").value = produto.quantidade || "";
    document.getElementById("endereco").value = produto.endereco || "";

    estoque.splice(indice,1);

    localStorage.setItem("estoque", JSON.stringify(estoque));

    carregarEstoque();

    abrirCadastro();

}

// =========================
// INICIAR
// =========================

document.addEventListener("DOMContentLoaded", carregarEstoque);