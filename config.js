function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("tabelaDados");
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            let xVal = getCellValue(x, n);
            let yVal = getCellValue(y, n);

            if (typeof xVal === "number" && typeof yVal === "number") {
                if ((dir == "asc" && xVal > yVal) || (dir == "desc" && xVal < yVal)) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                const cmp = String(xVal).localeCompare(String(yVal), "pt-BR", { sensitivity: "base" });
                if ((dir == "asc" && cmp > 0) || (dir == "desc" && cmp < 0)) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function getCellValue(cell, colIndex) {
    let val = cell.textContent.trim();

    if (colIndex === 0) {
        let parts = val.split("/");
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }

    if (colIndex === 3) {
        return parseFloat(val.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
    }

    return val;
}

let linhaSelecionada = null;
const contextMenu = document.getElementById("contextMenu");

document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

async function editarLinha() {
    if (linhaSelecionada) {
        const id = linhaSelecionada.getAttribute("data-id");
        await fetch(`http://localhost:5000/despesas/${id}`, { method: "PUT" });
        carregarTabela();
    }
    contextMenu.style.display = "none";
}

async function excluirLinha() {
    if (linhaSelecionada) {
        const id = linhaSelecionada.getAttribute("data-id");
        await fetch(`http://localhost:5000/despesas/${id}`, { method: "DELETE" });
        carregarTabela();
    }
    contextMenu.style.display = "none";
}

function abrirPopupAdicionar() {
    const popup = document.getElementById("divAdicionar");
    const blur = document.getElementById("blur");
    document.getElementById("blur").addEventListener("click", () => {
        abrirPopupAdicionar();
    });

    const isOpen = popup.style.display === "flex";

    if (isOpen) {
        popup.style.opacity = "0";
        popup.style.transform = "translate(-50%, -50%) scale(0.95)";
        blur.style.opacity = "0";
        blur.style.visibility = "hidden";

        setTimeout(() => {
            popup.style.display = "none";
        }, 300);
    } else {
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "translate(-50%, -50%) scale(1)";
        }, 10);
        blur.style.visibility = "visible";
        blur.style.opacity = "1";
    }
}

function fecharPopupAdicionar() {
    const popup = document.getElementById("divAdicionar");
    const blur = document.getElementById("blur");

    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%, -50%) scale(0.95)";
    blur.style.opacity = "0";
    blur.style.visibility = "hidden";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300);
}

document.getElementById("formAdicionar").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        validade: document.getElementById("validade").value,
        tipo: document.getElementById("tipo").value,
        descricao: document.getElementById("descricao").value,
        valor: parseFloat(document.getElementById("valor").value)
    };

    const response = await fetch("http://127.0.0.1:5000/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert("Despesa adicionada com sucesso!");
        carregarTabela(); // chama função que vai atualizar a tabela
        fecharPopupAdicionar();
    } else {
        alert("Erro ao adicionar despesa!");
    }
});

async function carregarTabela() {
    const response = await fetch("http://127.0.0.1:5000/despesas");
    const despesas = await response.json();

    const tbody = document.querySelector("#tabelaDados tbody");
    tbody.innerHTML = "";

    despesas.forEach(d => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", d._id);
        tr.innerHTML = `
            <td>${new Date(d.validade).toLocaleDateString("pt-BR")}</td>
            <td>${d.tipo}</td>
            <td>${d.descricao}</td>
            <td>R$${d.valor.toFixed(2).replace(".", ",")}</td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll("#tabelaDados tbody tr").forEach(row => {
        row.addEventListener("click", (event) => {
            linhaSelecionada = row;
            contextMenu.style.display = "block";
            contextMenu.style.left = event.pageX + "px";
            contextMenu.style.top = event.pageY + "px";
            event.stopPropagation();
            event.preventDefault();
        });
    });
}

// Fecha o menu ao clicar fora dele
document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

carregarTabela();