let recurring = document.querySelector('#recurring');
recurring.addEventListener("change", () => {
    let div = document.querySelector('#recurringDiv');
    if (recurring.checked){
        let outerPTag = document.createElement('p');
        div.appendChild(outerPTag);
        let text = document.createTextNode('Recurring Day:');
        outerPTag.appendChild(text);
        let select = document.createElement('select');
        select.id = "daySelection";
        select.name = "daySelection";
        outerPTag.appendChild(select);
        // appending selection options
        let days = [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ];
        for (let i = 0; i < days.length; i++) {
            let option = document.createElement("option");
            option.value = days[i];
            option.text = days[i];
            select.appendChild(option);
        }

        outerPTag = document.createElement('p');
        div.appendChild(outerPTag);
        text = document.createTextNode('From');
        outerPTag.appendChild(text);
        let time = document.createElement('input');
        time.type = 'time';
        time.name = 'recurrFrom';
        outerPTag.appendChild(time);

        text = document.createTextNode('To');
        outerPTag.appendChild(text);
        time = document.createElement('input');
        time.type = 'time';
        time.name = 'recurrTo';
        outerPTag.appendChild(time);
    } else {
        // removes all nodes from recurringDiv
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }
});