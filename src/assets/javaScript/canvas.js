function obterLarguraAlturaAtualCanvas() {
    var canvas = document.getElementById('canvas');
    return {
        altura: canvas.offsetHeight,
        largura: canvas.offsetWidth
    };
}

function draw(event, coord_click_x, coord_click_y) { // Método de classificação

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    let novoX = (coord_click_x * canvas.width) / canvas.offsetWidth;
    let novoY = (coord_click_y * canvas.height) / canvas.offsetHeight;

    const largura = 100;
    const altura = 100;
    const inicio_desenho_x = novoX - Math.round(largura / 2);
    const inicio_desenho_y = novoY - Math.round(altura / 2);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(inicio_desenho_x, inicio_desenho_y, largura, altura);
    ctx.stroke();
}

function exibirClassificacoes(classificacoes, indice = -1) {

    var canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    var ctx = canvas.getContext('2d');

    ctx.lineWidth = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const largura = 100;
    const altura = 100;

    var i, j, inicio_desenho_x, inicio_desenho_y;
    ctx.fillStyle = "red";

    if (indice === -1) {
        for (i = 0; i < classificacoes.length; i++) {

            ctx.beginPath();

            ctx.strokeStyle = obterCorDaLesao(classificacoes[i].lesao.nome.toString());

            inicio_desenho_x = Math.round(classificacoes[i].coord_centro_nucleo_x) - Math.round(largura / 2);
            inicio_desenho_y = Math.round(classificacoes[i].coord_centro_nucleo_y) - Math.round(altura / 2);

            ctx.font = "30px Arial";
            ctx.fillText('' + Number((Number(i)+1)), classificacoes[i].coord_centro_nucleo_x, classificacoes[i].coord_centro_nucleo_y);

            ctx.strokeRect(inicio_desenho_x, inicio_desenho_y, largura, altura);
            ctx.stroke();
        }
    }
    else {
        ctx.beginPath();

        ctx.strokeStyle = obterCorDaLesao(classificacoes[indice].lesao.nome.toString());

        inicio_desenho_x = classificacoes[indice].coord_centro_nucleo_x - Math.round(largura / 2);
        inicio_desenho_y = classificacoes[indice].coord_centro_nucleo_y - Math.round(altura / 2);

        ctx.font = "30px Arial";
        ctx.fillText('' + Number((Number(indice)+1)), classificacoes[indice].coord_centro_nucleo_x, classificacoes[indice].coord_centro_nucleo_y);

        ctx.strokeRect(inicio_desenho_x, inicio_desenho_y, largura, altura);
        ctx.stroke();
    }
}

var canvas; // Guarda a referência do container do canvas no html
var ctx; // Guarda a referência do contexto 2D que o canvas usa para manipular os atributos e métodos do canvas
var x, y; // Armazena a posição corrente do mouse enquanto desenha, após o término do desenho a posição final fica armazenada
var color = 'red'; // Armazena a cor de acordo com o tipo de classificação
var segmentos = []; // Armazena todos os pontos, cordenadas X e Y de cada ponto
var pontosDesenhados = []; // Armazena os pontos do desenho desde o clique até o usuário soltar o mouse

var xInicio, yInicio; // Armazena a coordenada de início do desenho da segmentação

var modal = false;


function editColor(cor) {
    color = cor;
}

function initCanvas(imagem) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var desenhando;

    canvas.onmousedown = function (e) {
        var rect = canvas.getBoundingClientRect();

        xInicio = Math.round(e.clientX - rect.left);
        yInicio = Math.round(e.clientY - rect.top);

        let novoX = Math.round((xInicio * canvas.width) / canvas.offsetWidth);
        let novoY = Math.round((yInicio * canvas.height) / canvas.offsetHeight);

        pontosDesenhados.push({ coord_x: novoX, coord_y: novoY });
        ctx.lineWidth = 1;
        desenhando = true;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(novoX, novoY);
    };

    canvas.onmousemove = function (e) {
        var rect = canvas.getBoundingClientRect();
        if (desenhando) {
            x = Math.round(e.clientX - rect.left);
            y = Math.round(e.clientY - rect.top);

            let novoX = Math.round((x * canvas.width) / canvas.offsetWidth);
            let novoY = Math.round((y * canvas.height) / canvas.offsetHeight);

            ctx.lineTo(novoX, novoY);

            ctx.stroke();
            pontosDesenhados.push({ coord_x: novoX, coord_y: novoY });
        }
    };

    canvas.onmouseup = function (e) {
        desenhando = false;

        let novoX = Math.round((xInicio * canvas.width) / canvas.offsetWidth);
        let novoY = Math.round((yInicio * canvas.height) / canvas.offsetHeight);

        let XFinal = Math.round((x * canvas.width) / canvas.offsetWidth);
        let YFinal = Math.round((y * canvas.height) / canvas.offsetHeight);

        ctx.lineTo(novoX, novoY);


        if (pontosDesenhados.length > 10) {

            calculoPontosDentroDeReta(XFinal, YFinal, novoX, novoY);
            ctx.stroke();
            ctx = canvas.getContext('2d');
            segmentos.push(pontosDesenhados);
            modal = true;
        }
        pontosDesenhados = [];
    };
};

function calculoPontosDentroDeReta(x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0),
        sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1 - y0),
        sy = y0 < y1 ? 1 : -1;
    var err = (dx > dy ? dx : -dy) / 2;
    while (true) {
        pontosDesenhados.push({ coord_x: x0, coord_y: y0 });

        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dy) {
            err += dx;
            y0 += sy;
        }
    }
}

function getModal() {
    return modal;
}

function setModal(estado) {
    modal = estado;
}

function getPontos() {
    return segmentos;
}

function setPontos(ponto) {
    segmentos = ponto;
}

function limparSegmentacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function limparVetorSegmentos() {
    segmentos = [];
}

function exibirSegmentacoes(segmentacoes, indice = -1, label = true) {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0000ff';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";

    if (indice == -1) {

        for (let i = 0; i < segmentacoes.celulas.length; i++) {

            ctx.beginPath();

            if(label) {
                ctx.font = "30px Arial";
                var num = Number(i + 1);
                ctx.fillText('' + num, segmentacoes.celulas[i].segmentos_citoplasma[0].coord_x, segmentacoes.celulas[i].segmentos_citoplasma[0].coord_y);
            }

            for (let j = 0; j < segmentacoes.celulas[i].segmentos_citoplasma.length; j++) {

                ctx.lineTo(segmentacoes.celulas[i].segmentos_citoplasma[j].coord_x, segmentacoes.celulas[i].segmentos_citoplasma[j].coord_y);
                ctx.stroke();
            }

            ctx.beginPath();
            for (let j = 0; j < segmentacoes.celulas[i].segmentos_nucleo.length; j++) {

                ctx.lineTo(segmentacoes.celulas[i].segmentos_nucleo[j].coord_x, segmentacoes.celulas[i].segmentos_nucleo[j].coord_y);
                ctx.stroke();
            }
        }
    }
    else {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();

        if(label) {
            ctx.font = "30px Arial";
            const num = Number(indice + 1);
            ctx.fillText('' + num, segmentacoes.celulas[indice].segmentos_citoplasma[0].coord_x, segmentacoes.celulas[indice].segmentos_citoplasma[0].coord_y);
        }

        for (let j = 0; j < segmentacoes.celulas[indice].segmentos_citoplasma.length; j++) {

            ctx.lineTo(segmentacoes.celulas[indice].segmentos_citoplasma[j].coord_x, segmentacoes.celulas[indice].segmentos_citoplasma[j].coord_y);
            ctx.stroke();
        }

        ctx.beginPath();
        for (let j = 0; j < segmentacoes.celulas[indice].segmentos_nucleo.length; j++) {

            ctx.lineTo(segmentacoes.celulas[indice].segmentos_nucleo[j].coord_x, segmentacoes.celulas[indice].segmentos_nucleo[j].coord_y);
            ctx.stroke();
        }
    }
}

function obterCorDaLesao(lesao) {
    // Ordem de gravidade lesoes: Normal, ASC-US, LSIL, ASC-H, HSIL, Carcinoma
    switch(lesao) {
        case "normal":
            return "#7CB5EC"; //Preto
        case "ASC-US":
            return "#434348"; //Preto
        case "LSIL":
            return "#90ED7D"; //Verde
        case "ASC-H":
            return "#F7A35C"; //laranja
        case "HSIL":
            return "#8085E9"; //Roxo        
        case "carcinoma":
            return "#F15C80"; //Rosa
    }
}
