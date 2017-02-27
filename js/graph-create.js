var global_word = "";
var network;

var options = {
    layout: {
        improvedLayout: true
    },
    physics: {
        "barnesHut": {
            "avoidOverlap": 1
        }
    }
};

/* //previous functions for spring application
function getWords(str) {
    return str.split(/\s+/).slice(0,5).join(" ");
}

function trim_string(label) {
    if (label.length > 15)
        return getWords(label) + "...";
    else
        return label;
}
function push_node(nodelist, id, wf_label) {
    if (id == 0)
        nodelist.push({id: id, label: wf_label});
    else
        nodelist.push({id: id, label: trim_string(wf_label), title: wf_label});
}

function add_neighbor(edgelist, id, label, weight) {
    var weightstring = (weight).toFixed(2);
    push_node(id, label);
    edgelist.push({from : 0, to: id, label: weightstring, value:weightstring, font: {align: 'middle'}});
}
*/

function initialize_network(nodelist, edgelist) {
    var container = document.getElementById('mynetwork');
    container.className = "center";

    var nodes = new vis.DataSet(nodelist);
    var edges = new vis.DataSet(edgelist);
    var data = {nodes: nodes, edges: edges};
    network = new vis.Network(container, data, options);
    network.on("doubleClick", function (params) {
        centerWord(nodes.get(params["nodes"][0])["title"]);
    });

    network.setOptions
    (
        {
            physics: {enabled:false}
        }
    );

    console.log('finished network creation');
}

function centerWord(word) {
    var nodelist = [];
    var edgelist = [];

    // create an array with nodes
    var nodes = [
        {id: 1, label: 'Node 1'},
        {id: 2, label: 'Node 2'},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
        {id: 5, label: 'Node 5'}
    ];

    // create an array with edges
    var edges = [
        {from: 1, to: 3},
        {from: 1, to: 2},
        {from: 2, to: 4},
        {from: 2, to: 5},
        {from: 3, to: 3}
    ];

    var id = 1;

    var searchInput = $("#searchWordInput");

    if (word.length == 0) {
        window.location.href = '/~lstanche/graph/';
        return false;
    }
    console.log("searched for: " + word.toLowerCase());
    global_word = word.toLowerCase();

    var searchWord = document.getElementById("searchWord");
    searchWord.textContent = 'Neighboring words of "' + global_word + '"';

    searchInput.val("");

    initialize_network(nodes, edges);

    return true;
}
