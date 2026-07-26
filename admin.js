let playlist = [];
let editingIndex = -1;

async function loadPlaylist() {
    try {
        const res = await fetch("./playlist.json?_t=" + Date.now());
        playlist = res.ok ? await res.json() : [];
    } catch(e) { playlist = []; }
    renderList();
}

function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

function renderList() {
    var q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
    var el = document.getElementById("songList");
    var ct = document.getElementById("songCount");
    var arr = q ? playlist.filter(function(s) { return s.title.toLowerCase().indexOf(q) >= 0 || s.artist.toLowerCase().indexOf(q) >= 0; }) : playlist;
    ct.textContent = arr.length;
    if (arr.length == 0) { el.innerHTML = '<div class=\"empty-msg\">' + (q ? "没有匹配的歌曲" : "歌单是空的，点击添加开始") + '</div>'; return; }
    var h = [];
    for (var i = 0; i < arr.length; i++) {
        var song = arr[i];
        var ri = q ? playlist.indexOf(song) : i;
        h.push('<div class=\"song-item\">');
        h.push('<div class=\"song-info\"><div class=\"song-title\">' + esc(song.title) + '</div><div class=\"song-artist\">' + esc(song.artist) + '</div></div>');
        h.push('<div class=\"song-actions\">');
        if (ri > 0) h.push('<button class=\"btn-move\" onclick=\"moveSong(' + ri + ',-1)\">↑</button>');
        if (ri < playlist.length - 1) h.push('<button class=\"btn-move\" onclick=\"moveSong(' + ri + ',1)\">↓</button>');
        h.push('<button class=\"btn-edit\" onclick=\"openEditModal(' + ri + ')\">✏ 编辑</button>');
        h.push('<button class=\"btn-del\" onclick=\"deleteSong(' + ri + ')\">🗑 删除</button>');
        h.push('</div></div>');
    }
    el.innerHTML = h.join('');
}

function openAddModal() {
    editingIndex = -1;
    document.getElementById("modalTitle").textContent = "➕ 添加歌曲";
    document.getElementById("inputTitle").value = ""; document.getElementById("inputArtist").value = ""; document.getElementById("inputUrl").value = "";
    document.getElementById("modalOverlay").classList.add("show");
}

function openEditModal(i) {
    var song = playlist[i]; if (!song) return;
    editingIndex = i;
    document.getElementById("modalTitle").textContent = "✏ 编辑歌曲";
    document.getElementById("inputTitle").value = song.title; document.getElementById("inputArtist").value = song.artist; document.getElementById("inputUrl").value = song.url;
    document.getElementById("modalOverlay").classList.add("show");
}

function closeModal() { document.getElementById("modalOverlay").classList.remove("show"); editingIndex = -1; }

function saveSong() {
    var t = document.getElementById("inputTitle").value.trim(); var a = document.getElementById("inputArtist").value.trim(); var u = document.getElementById("inputUrl").value.trim();
    if (!t || !u) { showStatus("请填写标题和文件名", "error"); return; }
    var s = { title: t, artist: a, url: u };
    if (editingIndex >= 0) { playlist[editingIndex] = s; showStatus("✅ 已更新: " + t, "success"); }
    else { playlist.push(s); showStatus("✅ 已添加: " + t, "success"); }
    closeModal(); renderList();
}

function deleteSong(i) {
    var s = playlist[i]; if (!s) return;
    if (!confirm("确定删除「" + s.title + "」？")) return;
    playlist.splice(i, 1); showStatus("🗑 已删除: " + s.title, "success"); renderList();
}

function moveSong(i, d) { var t = i + d; if (t < 0 || t >= playlist.length) return; var tmp = playlist[i]; playlist[i] = playlist[t]; playlist[t] = tmp; renderList(); }

function exportJSON() {
    if (playlist.length == 0) { showStatus("歌单为空", "error"); return; }
    var json = JSON.stringify(playlist, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "playlist.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showStatus("✅ 已下载，请覆盖 Git 仓库中的 playlist.json", "success");
}

function showStatus(m, t) {
    var el = document.getElementById("statusMsg"); el.textContent = m; el.className = "status-msg " + t;
    setTimeout(function() { el.className = "status-msg"; }, 5000);
}
document.getElementById("modalOverlay").addEventListener("click", function(e) { if (e.target === this) closeModal(); });
document.addEventListener("keydown", function(e) {
    if (e.key == "Enter" && document.getElementById("modalOverlay").classList.contains("show")) saveSong();
    if (e.key == "Escape") closeModal();
});
loadPlaylist();
