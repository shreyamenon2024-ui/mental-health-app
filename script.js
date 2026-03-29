function submitCheckin(){
    alert("Check-in submitted!");
}

const ctx = document.getElementById('stressChart');
if(ctx){
    new Chart(ctx,{
        type:'line',
        data:{
            labels:['Mon','Tue','Wed'],
            datasets:[{
    label: "Stress Level",
    data:[2,3,4]
}]
        }
    });
}