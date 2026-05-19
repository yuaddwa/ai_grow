/** 将 Markdown 文本拆成可渲染块（表格、标题、列表、段落等） */

function isTableRow(line) {
  return line.startsWith('|') && line.includes('|')
}

function parseTableRow(line) {
  const parts = line.replace(/^\|/, '').replace(/\|$/, '').split('|')
  return parts.map(c => c.trim())
}

function parseTable(lines) {
  if (lines.length < 1) return null
  const headers = parseTableRow(lines[0])
  let startIdx = 1
  if (lines.length > 1 && /^\|[\s\-:|]+\|$/.test(lines[1])) startIdx = 2
  const rows = []
  for (let j = startIdx; j < lines.length; j++) {
    rows.push(parseTableRow(lines[j]))
  }
  return { type: 'table', headers, rows }
}

export function parseMarkdown(content) {
  if (!content || typeof content !== 'string') return []
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()

    if (!trimmed) {
      i++
      continue
    }

    if (isTableRow(trimmed)) {
      const tableLines = []
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableLines.push(lines[i].trim())
        i++
      }
      const table = parseTable(tableLines)
      if (table) blocks.push(table)
      continue
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    const hm = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (hm) {
      blocks.push({ type: 'h' + hm[1].length, text: hm[2] })
      i++
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'list', items })
      continue
    }

    const paraLines = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t) break
      if (isTableRow(t) || /^(#{1,3})\s+/.test(t) || /^[-*_]{3,}$/.test(t) || /^[-*]\s+/.test(t)) break
      paraLines.push(t)
      i++
    }
    if (paraLines.length) blocks.push({ type: 'p', text: paraLines.join('\n') })
  }

  return blocks
}

/** 解析行内 **粗体** */
export function parseInline(text) {
  if (!text) return [{ text: '', bold: false }]
  const segments = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), bold: false })
    segments.push({ text: m[1], bold: true })
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), bold: false })
  if (!segments.length) segments.push({ text: String(text), bold: false })
  return segments
}
