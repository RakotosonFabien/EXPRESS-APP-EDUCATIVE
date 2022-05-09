const update = document.querySelector('#update-button')
update.addEventListener('click', _ => {
    console.log('Main js called')
    fetch('/quotes', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Fabien',
            quote: 'Quote 1'
        })
    })
})