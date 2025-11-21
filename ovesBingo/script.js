function saveState(itemsArr) {
  const cells = document.querySelectorAll(".cell")
  const states = [...cells].map(c => ({
    cross: c.classList.contains("cross")
  }))
  const names = itemsArr ? itemsArr.map(i => i.name) : [...cells].map(c => c.textContent)
  const savedItems = names.map(n => items.find(i => i.name === n))
  localStorage.setItem("bingoData", JSON.stringify({items: savedItems, states}))
}

function initBingo() {
  const saved = JSON.parse(localStorage.getItem("bingoData"))
  const board = document.querySelector(".board")
  const desc = document.querySelector(".description")
  board.innerHTML = ""

  let chosenItems
  let firstRender = false

  if (saved && saved.items) {
    chosenItems = saved.items
  } else {
    chosenItems = [...items].sort(() => Math.random() - 0.5).slice(0, 25)
    firstRender = true
  }

  chosenItems.forEach((item, i) => {
    const cell = document.createElement("div")
    cell.className = "cell"
    cell.textContent = item.name

    if (saved && saved.states && saved.states[i]) {
      if (saved.states[i].cross) cell.classList.add("cross")
    }

    cell.onclick = () => {
      const isActive = cell.classList.contains("active")
      document.querySelectorAll(".cell").forEach(c => c.classList.remove("active"))
      if (isActive) {
        desc.innerHTML = ""
      } else {
        cell.classList.add("active")
        desc.innerHTML = `<b>${item.name}:</b> ${item.description}`
      }
      saveState()
    }

    cell.oncontextmenu = e => {
      e.preventDefault()
      cell.classList.toggle("cross")
      saveState()
    }

    board.appendChild(cell)
  })

  if (firstRender) saveState(chosenItems)
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".refresh-button").onclick = () => {
    localStorage.removeItem("bingoData")
    location.reload()
  }
  initBingo()
})

