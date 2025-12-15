const SEEN_NEW_KEY = "seenNewItems"
const BINGO_KEY = "bingoData"

function getSeenNewSet() {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_NEW_KEY) || "[]")
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveSeenNewSet(seenSet) {
  localStorage.setItem(SEEN_NEW_KEY, JSON.stringify([...seenSet]))
}

function cleanupSeenNew() {
  const seen = getSeenNewSet()
  const validNewNames = new Set(items.filter(i => i.new).map(i => i.name))
  const filtered = [...seen].filter(name => validNewNames.has(name))
  if (filtered.length !== seen.size) localStorage.setItem(SEEN_NEW_KEY, JSON.stringify(filtered))
}

function cleanupBingoData() {
  const raw = localStorage.getItem(BINGO_KEY)
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.items)) return
    const validNames = new Set(items.map(i => i.name))
    const cleanedItems = data.items.filter(i => i && validNames.has(i.name))
    const cleanedStates = Array.isArray(data.states) ? data.states.slice(0, cleanedItems.length) : []
    localStorage.setItem(BINGO_KEY, JSON.stringify({ items: cleanedItems, states: cleanedStates }))
  } catch { }
}

function saveState(itemsArr) {
  const cells = document.querySelectorAll(".cell")
  const states = [...cells].map(c => ({
    cross: c.classList.contains("cross")
  }))

  const itemsToSave = itemsArr || window.currentBingoItems || []
  localStorage.setItem(BINGO_KEY, JSON.stringify({ items: itemsToSave, states }))
}

function initBingo() {
  cleanupSeenNew()
  cleanupBingoData()

  const saved = JSON.parse(localStorage.getItem(BINGO_KEY) || "null")
  const board = document.getElementById("board")
  const desc = document.getElementById("desc")
  const seenNew = getSeenNewSet()

  board.innerHTML = ""

  let chosenItems = []
  let savedStates = []
  let firstRender = false

  if (saved && Array.isArray(saved.items)) {
    chosenItems = saved.items
      .map(si => items.find(i => i.name === si.name))
      .filter(Boolean)
    savedStates = Array.isArray(saved.states) ? saved.states : []
  } else {
    firstRender = true
  }

  if (chosenItems.length < 25) {
    const already = new Set(chosenItems.map(i => i.name))
    const pool = items.filter(i => !already.has(i.name))
    while (chosenItems.length < 25 && pool.length) {
      const idx = Math.floor(Math.random() * pool.length)
      chosenItems.push(pool.splice(idx, 1)[0])
    }
    if (chosenItems.length === 25) firstRender = true
  }

  window.currentBingoItems = chosenItems

  chosenItems.forEach((item, i) => {
    const cell = document.createElement("div")
    cell.className = "cell"
    cell.dataset.name = item.name

    const text = document.createElement("span")
    text.className = "cell-text"
    text.textContent = item.name
    cell.appendChild(text)

    if (item.new && !seenNew.has(item.name)) {
      const badge = document.createElement("span")
      badge.className = "badge-new"
      badge.textContent = "Новое"
      cell.appendChild(badge)
    }

    if (savedStates[i] && savedStates[i].cross) cell.classList.add("cross")

    cell.onclick = () => {
      if (item.new && !seenNew.has(item.name)) {
        seenNew.add(item.name)
        saveSeenNewSet(seenNew)
        const badge = cell.querySelector(".badge-new")
        if (badge) badge.remove()
      }

      const isActive = cell.classList.contains("active")
      document.querySelectorAll(".cell").forEach(c => c.classList.remove("active"))

      if (isActive) {
        desc.style.display = "none"
      } else {
        cell.classList.add("active")
        desc.innerHTML = `<b>${item.name}:</b> ${item.description}`
        desc.style.display = "block"
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
  document.getElementById("refreshBtn").onclick = () => {
    localStorage.removeItem(BINGO_KEY)
    location.reload()
  }
  initBingo()
})
