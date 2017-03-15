/*eslint-disable quotes*/
module.exports = [
    {
        isSimple: true,
        user: "139109512744402944",
        content: "http://i.imgur.com/ACoUhAW.gifv",
        call: "holdup"
    },
    {
        isSimple: true,
        user: "138043934143152128",
        content: "http://i.imgur.com/1xzQkSo.png",
        call: "brutal"
    },
    {
        isSimple: true,
        user: "137976237292388353",
        content: "test",
        call: "etest"
    },
    {
        isSimple: false,
        function: (id) => {
            return new Promise((resolve) => {
                /*eslint-disable indent*/
                switch(id) {
                    case "138043934143152128": resolve("http://i.imgur.com/MXeL1Jh.gifv"); break; //Fox
                    case "137976237292388353": resolve("http://i.imgur.com/6AMJZaD.gifv"); break; //Mardan
                    case "139109512744402944": resolve("http://i.imgur.com/LUfk3HX.gifv"); break; //Quantum
                    default: resolve("( ͡° ͜ʖ ͡°)"); break;
                }
                /*eslint-enable indent*/
            });
        },
        call: "lenny"
    }
];