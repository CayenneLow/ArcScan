let recurring = document.querySelector('#recurring');
recurring.addEventListener("change", () => {
    let div = document.querySelector('#recurringDiv');
    if (recurring.checked){
        let outerPTag = document.createElement('p');
        div.appendChild(outerPTag);
        let text = document.createTextNode('Recurr until: ');
        outerPTag.appendChild(text);

        let endRecurr = document.createElement('input');
        endRecurr.type = 'date';
        endRecurr.name = 'endRecurr';
        outerPTag.appendChild(endRecurr);
        
        text = document.createTextNode('(Recurrs weekly)');
        outerPTag.appendChild(text);
    } else {
        // removes all nodes from recurringDiv
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }
});
