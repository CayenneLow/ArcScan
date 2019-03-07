let recurring = document.querySelector('#recurring');
recurring.addEventListener("change", () => {
    let div = document.querySelector('#recurringDiv');
    if (recurring.checked){
        // Form
        let recurrForm = document.createElement('form');
        recurrForm.method = "POST";
        recurrForm.action = "/org/event/createEvent";
        // p tag
        let outerPTag = document.createElement('p');
        recurrForm.appendChild(outerPTag);
        // day selection
        let text = document.createTextNode('Recurring Day:');
        outerPTag.appendChild(text);
        let select = document.createElement('select');
        select.id = "daySelection";
        select.required = true;
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
        //p tag
        outerPTag = document.createElement('p');
        recurrForm.appendChild(outerPTag);
        // date selection
        text = document.createTextNode('From');
        outerPTag.appendChild(text);
        let time = document.createElement('input');
        time.type = 'time';
        time.name = 'recurrFrom';
        time.required = true;
        outerPTag.appendChild(time);

        text = document.createTextNode('To');
        outerPTag.appendChild(text);
        time = document.createElement('input');
        time.type = 'time';
        time.name = 'recurrTo';
        time.required = true;
        outerPTag.appendChild(time);
        // append to main div
        div.appendChild(recurrForm);
    } else {
        // removes all nodes from recurringDiv
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }
});
