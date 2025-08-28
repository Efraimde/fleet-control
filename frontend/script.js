const API_URL = "http://localhost:3000";

// Carregamento
function loadVehicles(){
    fetch(`${API_URL}/vehicles`).then(r=>r.json()).then(data=>{
        const tbody=document.getElementById("vehicleList"); tbody.innerHTML="";
        data.forEach(v=>{ tbody.innerHTML+=`<tr><td>${v.id}</td><td>${v.placa}</td><td>${v.modelo}</td><td>${v.ano}</td><td>${v.tipo}</td><td>${v.status}</td></tr>`});
        loadVehicleChart(data);
    });
}

function loadDrivers(){
    fetch(`${API_URL}/drivers`).then(r=>r.json()).then(data=>{
        const tbody=document.getElementById("driverList"); tbody.innerHTML="";
        data.forEach(d=>{ tbody.innerHTML+=`<tr><td>${d.id}</td><td>${d.nome}</td><td>${d.cnh}</td><td>${d.telefone}</td><td>${d.email}</td></tr>`});
    });
}

function loadTrips(){
    fetch(`${API_URL}/trips`).then(r=>r.json()).then(data=>{
        const tbody=document.getElementById("tripList"); tbody.innerHTML="";
        data.forEach(t=>{ tbody.innerHTML+=`<tr><td>${t.id}</td><td>${t.veiculo_id}</td><td>${t.motorista_id}</td><td>${t.partida}</td><td>${t.destino}</td><td>${t.km}</td><td>${t.combustivel}</td><td>${t.data}</td></tr>`});
        loadTripsKmChart(data);
    });
}

function loadMaintenance(){
    fetch(`${API_URL}/maintenance`).then(r=>r.json()).then(data=>{
        const tbody=document.getElementById("maintenanceList"); tbody.innerHTML="";
        data.forEach(m=>{ tbody.innerHTML+=`<tr><td>${m.id}</td><td>${m.veiculo_id}</td><td>${m.tipo}</td><td>${m.descricao}</td><td>${m.data}</td><td>${m.custo}</td></tr>`});
        loadMaintenanceCostChart(data);
    });
}

// Eventos de cadastro
document.getElementById("vehicleForm").addEventListener("submit", e=>{
    e.preventDefault();
    const vehicle={
        placa: document.getElementById("placa").value,
        modelo: document.getElementById("modelo").value,
        ano: parseInt(document.getElementById("ano").value),
        tipo: document.getElementById("tipo").value,
        status: document.getElementById("status").value
    };
    fetch(`${API_URL}/vehicles`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(vehicle)})
        .then(()=>{ e.target.reset(); loadVehicles(); });
});

document.getElementById("driverForm").addEventListener("submit", e=>{
    e.preventDefault();
    const driver={
        nome: document.getElementById("nome").value,
        cnh: document.getElementById("cnh").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value
    };
    fetch(`${API_URL}/drivers`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(driver)})
        .then(()=>{ e.target.reset(); loadDrivers(); });
});

document.getElementById("tripForm").addEventListener("submit", e=>{
    e.preventDefault();
    const trip={
        veiculo_id: parseInt(document.getElementById("veiculo_id").value),
        motorista_id: parseInt(document.getElementById("motorista_id").value),
        partida: document.getElementById("partida").value,
        destino: document.getElementById("destino").value,
        km: parseFloat(document.getElementById("km").value),
        combustivel: parseFloat(document.getElementById("combustivel").value),
        data: document.getElementById("data").value
    };
    fetch(`${API_URL}/trips`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(trip)})
        .then(()=>{ e.target.reset(); loadTrips(); });
});

document.getElementById("maintenanceForm").addEventListener("submit", e=>{
    e.preventDefault();
    const m={
        veiculo_id: parseInt(document.getElementById("veiculo_manut_id").value),
        tipo: document.getElementById("tipo_manut").value,
        descricao: document.getElementById("descricao_manut").value,
        data: document.getElementById("data_manut").value,
        custo: parseFloat(document.getElementById("custo_manut").value)
    };
    fetch(`${API_URL}/maintenance`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(m)})
        .then(()=>{ e.target.reset(); loadMaintenance(); });
});

// Gráficos
function loadVehicleChart(data){
    const ctx=document.getElementById("vehicleStatusChart").getContext("2d");
    const count=data.reduce((acc,v)=>{ acc[v.status]=(acc[v.status]||0)+1; return acc; }, {});
    if(window.vehicleChart) window.vehicleChart.destroy();
    window.vehicleChart = new Chart(ctx,{
        type:"pie",
        data:{
            labels:Object.keys(count),
            datasets:[{label:"Veículos", data:Object.values(count), backgroundColor:["#4CAF50","#F44336"]}]
        }
    });
}

function loadTripsKmChart(data){
    const ctx=document.getElementById("tripsKmChart").getContext("2d");
    const sum=data.reduce((acc,t)=>{ acc[t.veiculo_id]=(acc[t.veiculo_id]||0)+t.km; return acc; }, {});
    if(window.tripsChart) window.tripsChart.destroy();
    window.tripsChart = new Chart(ctx,{
        type:"bar",
        data:{ labels:Object.keys(sum), datasets:[{label:"Km percorridos", data:Object.values(sum), backgroundColor:"#2196F3"}] }
    });
}

function loadMaintenanceCostChart(data){
    const ctx=document.getElementById("maintenanceCostChart").getContext("2d");
    const sum=data.reduce((acc,m)=>{ acc[m.veiculo_id]=(acc[m.veiculo_id]||0)+m.custo; return acc; }, {});
    if(window.maintenanceChart) window.maintenanceChart.destroy();
    window.maintenanceChart = new Chart(ctx,{
        type:"bar",
        data:{ labels:Object.keys(sum), datasets:[{label:"Custo de manutenção", data:Object.values(sum), backgroundColor:"#FF9800"}] }
    });
}

// Inicialização
loadVehicles();
loadDrivers();
loadTrips();
loadMaintenance();

