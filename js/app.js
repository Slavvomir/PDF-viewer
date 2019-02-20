const url = "./docs/przepisy.pdf";

let doc = null,
    pageNum = 1,
    isRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// render the page
const renderPage = num => {
    isRendering = true;

    // get page
    doc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then(()=>{
            isRendering = false;

            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // current page
        document.querySelector('#page-num').textContent = num;
    });
}

// check for pages rendering
const queueRenderPage = num => {
    if(isRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

// show prev page
const showPrevPage = () => {
    if(pageNum <= 1){
        return;
    } 
    pageNum --;
    queueRenderPage(pageNum)
}

// show next page
const showNextPage = () => {
    if(pageNum >= doc.numPages){
        return;
    } 
    pageNum ++;
    queueRenderPage(pageNum)
}


//get document
pdfjsLib.getDocument(url).promise.then(pdfDoc => {
    doc = pdfDoc;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum)
})
    .catch(err => {
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);
        document.querySelector('.nav').style.display = 'none';
    })

// events on buttons
document.querySelector('#prev-page').addEventListener('click', showPrevPage)
document.querySelector('#next-page').addEventListener('click', showNextPage)