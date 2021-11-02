let names = ['Laura','Juan','Fernando','María','Carlos','Lucía','David'];

let surnames = ['Fernández','Etxevarría','Nadal','Novo','Sánchez','López','García'];

let activities = ['padel','tenis','esgrima','aquagym','pesas','cardio','step'];

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomSeveralActivities() {
    let selectedActivities = [];
    for(let j = 0; j < 3; j++) {
        selectedActivities.push(activities[Math.floor(Math.random() * activities.length)])
    }
    return selectedActivities;
}

let clients = [];

for(let i = 0; i < 1500; i++) {
    clients.push({
        name: names[Math.floor(Math.random() * names.length)],
        surname1: surnames[Math.floor(Math.random() * surnames.length)],
        surname2: surnames[Math.floor(Math.random() * surnames.length)],
        activities: getRandomSeveralActivities(),
        subscriptionDate: getRandomDate(new Date(2015, 0, 1), new Date())
    })
}