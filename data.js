let names = ['Laura','Juan','Fernando','María','Carlos','Lucía','David'];

let surnames = ['Fernández','Etxevarría','Nadal','Novo','Sánchez','López','García'];

let activities = ['padel','tenis','esgrima','aquagym','pesas','cardio','step'];

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomActivities(numberActivities) {
    let selectedActivities = [];
    for(let i = 0; i < numberActivities; i++) {
        selectedActivities.push(activities[Math.floor(Math.random() * activities.length)])
    }
}

let clients = [];

for(let i = 0; i < 1500; i++) {
    clients.push({
        name: names[Math.floor(Math.random() * names.length)],
        surname1: surnames[Math.floor(Math.random() * surnames.length)],
        surname2: surnames[Math.floor(Math.random() * surnames.length)],
        activities: getRandomActivities(3),
        subscriptionDate: getRandomDate(new Date(2015, 0, 1), new Date())
    })
}