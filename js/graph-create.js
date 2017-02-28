var global_word = "";
var idToLabel = {};
var labelToId = {};
var adjList = {};
var edgeList = {};

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

// getJSON is asynchronous so we need to wait for it...
function loadIdToLabel() {
    $.getJSON('json/idToLabel.json', function(data) {
        idToLabel = data;
        console.log("finished idToLabel");
    });
}

function loadLabelToId() {
    $.getJSON('json/labelToId.json', function(data) {
        labelToId = data;
        console.log("finished labelToId");
    });
}

function loadAdjList() {
    $.getJSON('json/adjList.json', function(data) {
        adjList = data;
        console.log("finished adjList");
    });
}

function loadEdgeList() {
    $.getJSON('json/edgeList.json', function(data) {
        edgeList = data;
        console.log("finished edgeList");
    });
}
function loadWfGraphFiles() {
    loadIdToLabel();
    loadLabelToId();
    loadAdjList();
    loadEdgeList();
}

/*
    WFGraph Functions
 */
function wfGraph_getLabel(id) {
    return idToLabel[id];
}

function wfGraph_getId(label) {
    return labelToId[label];
}

function wfGraph_getNeighbors(id) {
    return adjList[id];
}

function wfGraph_getWeight(id1, id2) {
    var joined = id1 + "-" + id2;
    return edgeList[joined];
}

function wfGraph_getNeighborsLabels (idList) {
    var labelList = [];
    for (var i in idList) {
        labelList.push(wfGraph_getLabel(idList[i]));
    }

    return labelList;
}
/*
    end WFGraph functions
 */

function initialize_network(nodelist, edgelist) {
    var network;

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


//TODO: Write graph population function
function temp_initialize() {
    var container = document.getElementById('mynetwork');

    var word_id = wfGraph_getId(global_word);
    var word_neighbors_ids = wfGraph_getNeighbors(word_id);
    var word_neighbors = wfGraph_getNeighborsLabels(word_neighbors_ids);

    container.className = "";
    container.innerHTML = 'You searched for <strong>"' + global_word + '"</strong>. <br/>'
    + "Neighbors are: <ul>";

    for (var i in word_neighbors) {
        container.innerHTML += "<li>"+ word_neighbors[i] +". Weight: " + wfGraph_getWeight(word_id, word_neighbors_ids[i])+"</li>";
    }
    container.innerHTML += "</ul>";

}

function centerWord(word) {
    var nodelist = [];
    var edgelist = [];

    /* get search word */
    var searchInput = $("#searchWordInput");

    if (word.length == 0) {
        window.location.href = '/~lstanche/graph/';
        return false;
    }
    console.log("searched for: " + word.toLowerCase());
    global_word = word.toLowerCase();

    /* put search word into header of graph and clear input*/
    var searchWord = document.getElementById("searchWord");
    searchWord.textContent = 'Neighbors of "' + global_word + '"';
    searchInput.val("");

    temp_initialize();
}
