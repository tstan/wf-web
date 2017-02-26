var nodelist = [];
var edgelist = [];
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

var current_id = 1;

function getWords(str) {
    return str.split(/\s+/).slice(0,5).join(" ");
}

function trim_string(label) {
    if (label.length > 15)
        return getWords(label) + "...";
    else
        return label;
}
function push_node(id, wf_label) {
    if (id == 0)
        nodelist.push({id: id, label: wf_label});
    else
        nodelist.push({id: id, label: trim_string(wf_label), title: wf_label});
}

function add_neighbor(label, weight) {
    var weightstring = (weight).toFixed(2);
    push_node(current_id, label);
    edgelist.push({from : 0, to: current_id, label: weightstring, value:weightstring, font: {align: 'middle'}});
    current_id++;
}

function centerWordClick(word) {
    if (word.length == 0) {
        window.location.href = '/';
    }
    location.href = word;
}
var network;
function initialize_network() {
    var container = document.getElementById('mynetwork');

    var nodes = new vis.DataSet(nodelist);
    var edges = new vis.DataSet(edgelist);
    var data = {nodes: nodes, edges: edges};
    network = new vis.Network(container, data, options);
    network.on("doubleClick", function (params) {
        centerWordClick(nodes.get(params["nodes"][0])["title"]);
    });

    console.log('finished network creation');

}

$(document).ready(function(){
    network.setOptions
    (
        {
        physics: {enabled:false}
        }
    );
});