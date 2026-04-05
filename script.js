const WEB_APP_URL = "/api"; 
const GITHUB_UPLOAD_PAGE = "https://admin-hehe.github.io/upload-fee/";
tailwind.config = {
    darkMode: 'media', 
    theme: { 
        extend: { 
            colors: { 
                'dark-surface': '#0f172a',
                'dark-card': '#1e293b'
            }
        } 
    }
}
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

async function loadData() {
    const refreshIcon = document.getElementById('refreshIcon');
    refreshIcon.classList.add('animate-spin-custom');

    try {
        const response = await fetch(`${WEB_APP_URL}?action=getData`);
        const result = await response.json();

        if (result.result === 'success') {
            allData = result.data.reverse();
            filteredData = [...allData];
            renderTable();
            document.getElementById('tableContainer').classList.remove('hidden');
        }
    } catch (e) { 
        console.error(e); 
        toast("Gagal memuat data!", "error");
    } finally { 
        refreshIcon.classList.remove('animate-spin-custom'); 
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredData = allData.filter(item => 
        (item.pic && item.pic.toLowerCase().includes(query)) ||
        (item.nama_kegiatan && item.nama_kegiatan.toLowerCase().includes(query)) ||
        (item.vendor && item.vendor.toLowerCase().includes(query)) ||
        (item.id && item.id.toLowerCase().includes(query))
    );
    currentPage = 1;
    renderTable();
}

function renderTable() {
const tbody = document.getElementById('dataTableBody');
tbody.innerHTML = '';
const start = (currentPage - 1) * rowsPerPage;
const end = start + rowsPerPage;

filteredData.slice(start, end).forEach((item, i) => {
const row = tbody.insertRow();
const statusColor = item.status === 'Done' ? 'text-emerald-500' : item.status === 'Pending' ? 'text-red-500' : 'text-amber-500';
row.className = 'group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-200 cursor-pointer row-animate hover:shadow-md hover:-translate-y-0.5';

row.onclick = () => openAdminModal(item.id);
row.style.animationDelay = `${i * 0.05}s`;

row.innerHTML = `
    <td class="px-6 py-4 font-mono font-black text-indigo-600 dark:text-indigo-400 text-xs">${item.id}</td>
    <td class="px-6 py-4">
        <span class="block font-bold text-sm text-slate-700 dark:text-slate-200">${item.pic}</span>
        <span class="text-[9px] font-black uppercase ${statusColor} tracking-widest">● ${item.status || 'Pending'}</span>
    </td>
    <td class="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-xs">${item.nama_kegiatan}</td>
    <td class="px-6 py-4 font-bold text-xs uppercase text-slate-800 dark:text-slate-200">${item.vendor}</td>
    <td class="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400 text-xs">${item.harga}</td>
    <td class="px-6 py-4">
        ${item.link_dokumentasi ? 
        `<a href="${item.link_dokumentasi}" target="_blank" onclick="event.stopPropagation();" class="text-[9px] font-black text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700 transition">OPEN</a>` : 
        `<span class="text-[9px] font-bold text-slate-300 italic">EMPTY</span>`}
    </td>
    <td class="px-6 py-4 text-center">
        <button onclick="handleCopy(event, '${item.id}')" class="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
    </td>
`;
});

document.getElementById('currentPageDisplay').textContent = currentPage;
document.getElementById('prevPage').disabled = currentPage === 1;
document.getElementById('nextPage').disabled = end >= filteredData.length;
}

function changePage(step) {
    currentPage += step;
    renderTable();
}

function handleCopy(e, id) {
    if (e) e.stopPropagation();
    const shareLink = `${GITHUB_UPLOAD_PAGE}?id=${id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
        toast("Link Berhasil Disalin");
    }).catch(() => {
        toast("Gagal menyalin link!", "error");
    });
}
function openAdminModal(id) {
const data = allData.find(item => item.id === id);
if (!data) return;

const tgl = (data.tanggal_task !== "-" && data.tanggal_task !== "" && data.advanced !== "NO") 
? ` | <span class="text-amber-500 font-bold">${new Date(data.tanggal_task).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>` 
: "";
document.getElementById('adminModal').classList.remove('hidden');

// Isi Info Detail (Kiri)
document.getElementById('modalId').textContent = data.id;
document.getElementById('modalPic').textContent = `PIC: ${data.pic}`;
document.getElementById('infoKegiatan').innerHTML = `${data.nama_kegiatan}${tgl}`;
document.getElementById('infoBrand').textContent = data.brand || '-';
document.getElementById('infoVendor').textContent = data.vendor || '-';
document.getElementById('infoKontak').textContent = `${data.email_vendor || ''} | ${data.telp_vendor || ''}`;
document.getElementById('infoKode').textContent = data.kode || '-';
document.getElementById('infoHarga').textContent = data.harga;

const docPlaceholder = document.getElementById('docPlaceholder');
docPlaceholder.innerHTML = data.link_dokumentasi ? 
`<a href="${data.link_dokumentasi}" target="_blank" class="text-[10px] font-black text-indigo-600 underline">LIHAT FILE ↗</a>` : 
`<span class="text-[10px] font-bold text-slate-400 italic font-mono">BELUM UPLOAD</span>`;

// Isi Form Update (Kanan)
document.getElementById('adminRecordId').value = data.id;
document.getElementById('adminStatus').value = data.status || 'Pending';
document.getElementById('adminTglTf').value = formatForInputDate(data.tgl_transfer);
document.getElementById('adminBuktiTf').checked = (data.bukti_tf === true || data.bukti_tf === "TRUE");
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
}
// HANDLE SUBMIT FORM
document.getElementById('adminForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveAdminBtn');
    btn.disabled = true;
    btn.textContent = "MENYIMPAN...";

    const payload = {
        action: 'updateAdminStatus',
        record_id: document.getElementById('adminRecordId').value,
        status: document.getElementById('adminStatus').value,
        tgl_transfer: document.getElementById('adminTglTf').value,
        bukti_tf: document.getElementById('adminBuktiTf').checked
    };

    try {
        const res = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: new URLSearchParams(payload)
        });
        const result = await res.json();
        
        if(result.result === 'success') {
            toast("Perubahan Berhasil Disimpan!");
            closeAdminModal();
            loadData();
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Koneksi Gagal");
    } finally {
        btn.disabled = false;
        btn.textContent = "SIMPAN PERUBAHAN";
    }
};

function formatForInputDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0];
}

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    m.innerText = (type === 'success' ? "✅ " : "❌ ") + msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAdminModal();
});

window.onload = loadData;
