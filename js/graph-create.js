var global_word = "";
var idToLabel = {};
var labelToId = {};
var adjList = {};
var edgeList = {};
var vertexDb = {};

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

function getWords(str) {
    var temp = [];
    var split = str.split(/\s+/);
    var i = 0;
    var total = 0;
    while (total < 12 && i < split.length) {
        temp.push(split[i]);
        total += (split[i].length);
        i++;
    }
    return temp.join(" ");
}

function trim_string(label) {
    if (label.length > 12)
        return getWords(label) + "...";
    else
        return label;
}

function push_node(nodelist, id, wf_label, realId) {
    if (!isSense(realId)) {
        nodelist.push({id: id, label: wf_label, title: wf_label});
    }
    else {
        nodelist.push({id: id, label: wf_label, title: wf_label, color:'#C2FABC'});
    }
}

function add_neighbor(nodelist, edgelist, id, label, weight, realId) {
    var weightstring = (weight).toFixed(2);

    if (!isSense(realId)) {
        nodelist.push(
            {
                id: id,
                label: trim_string(label),
                title: '"' + label + '"',
                search: label
            }
        );
        edgelist.push(
            {
                from : 0,
                to: id,
                label: weightstring,
                value:weightstring,
                scaling:{max: 10},
                font: {align: 'middle'}
            }
        );
    }
    else {
        nodelist.push(
            {
                id: id,
                label: trim_string(label),
                title: '"' + label + '"',
                search: label,
                color:'#C2FABC'
            }
        );
        edgelist.push(
            {
                from : 0,
                to: id,
                label: weightstring,
                value:weightstring,
                scaling:{max: 10},
                font: {align: 'middle'},
                color:{color:'green'}
            }
        );
    }
}


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
function loadWFs() {
    $.getJSON('json/wfVertexDb.json', function(data) {
        vertexDb = data;
        console.log("finished vertexDb");
    });
}

function loadEdgeList() {
    $.ajax({
        url: 'json/edgeList.json',
        dataType: 'json',
        success: function(data) {
            edgeList = data;
            console.log("finished edgeList");
            $('#myOverlay').hide();
        }
    });
}

function loadWfGraphFiles() {
    loadIdToLabel();
    loadLabelToId();
    loadAdjList();
    loadEdgeList();
    loadWFs();
}

/*
    WFGraph Functions
 */

function isSense(id) {
    return !vertexDb.hasOwnProperty(id);
}
function wfGraph_getLabel(id) {
    return idToLabel[id];
}

function wfGraph_getId(label) {
    return labelToId[label];
}

function wfGraph_getNeighbors(id) {
    return adjList[id];
}

function wfGraph_getNeighborsNoSenses(id, maxDepth) {
    var result = [];
    var neighbor_ids = wfGraph_getNeighbors(id).slice(0); //need to clone for value

    var neighbors = [];
    var i = 0;
    while (i < neighbor_ids.length) {
        neighbors.push({id: neighbor_ids[i], weight: parseFloat(wfGraph_getWeight(id, neighbor_ids[i]))});
        i++;
    }

    var next = [];
    var depth = 0;
    while (neighbors.length>0 && depth < maxDepth) {
        var current =  neighbors.pop();
        if (!isSense(current.id)) {
            result.push(current);
        }
        else {
            next.push(current);
        }
        if (neighbors.length<=0 && depth < maxDepth) {
            depth ++;

            while (next.length > 0) {
                var currentNext = next.pop();
                var nextNeighbor_ids = wfGraph_getNeighbors(currentNext.id).slice(0);
                i = 0;
                while (i < nextNeighbor_ids.length) {
                    neighbors.push(
                        {
                            id: nextNeighbor_ids[i],
                            weight: currentNext.weight * parseFloat(wfGraph_getWeight(currentNext.id, nextNeighbor_ids[i]))
                        });
                    i++;
                }
                console.log(next);
                console.log(neighbors);
            }
        }
    }

    return result;
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

function sensesOn() {
    return $('#senseCheckbox').is(":checked");
}


function getUnique(count, arrayNum) {
    // Make a copy of the array
    var tmp = arrayNum.slice(0);
    var ret = [];

    for (var i = 0; i < count && i < arrayNum.length; i++) {
        var index = Math.floor(Math.random() * tmp.length);
        var removed = tmp.splice(index, 1);
        // Since we are only removing one element
        ret.push(removed[0]);
    }
    return ret;
}

function initialize_network() {
    var nodelist = [];
    var edgelist = [];
    var network;


    var word_id = wfGraph_getId(global_word);
    var word_neighbors_ids = wfGraph_getNeighbors(word_id).slice(0);

    var value = $('#sel1').val();
    console.log(value);
    if ($.isNumeric(value)) {
        word_neighbors_ids = getUnique(value, word_neighbors_ids);
        console.log("found number");
        console.log(word_neighbors_ids);
    }

    var total_weight = 0;
    var weights = [];

    for (var i in word_neighbors_ids) {
        var weight = parseFloat(wfGraph_getWeight(word_id, word_neighbors_ids[i]))
        weights.push(weight);
        total_weight += weight;
    }

    push_node(nodelist, 0, global_word, word_id);
    for (var j in word_neighbors_ids) {
        add_neighbor(
            nodelist,
            edgelist,
            j+1,  // id
            wfGraph_getLabel(word_neighbors_ids[j]),
            weights[j]/total_weight,
            word_neighbors_ids[j]
        )
    }

    var container = document.getElementById('mynetwork');
    container.innerHTML = "";
    container.className = "center";

    var nodes = new vis.DataSet(nodelist);
    var edges = new vis.DataSet(edgelist);
    var data = {nodes: nodes, edges: edges};
    network = new vis.Network(container, data, options);
    network.on("doubleClick", function (params) {
        centerWord(nodes.get(params["nodes"][0])["search"]);
    });

    network.setOptions
    (
        {
            physics: {enabled:false}
        }
    );

    console.log('finished network creation with senses');
}

function initialize_network_no_senses() {
    var nodelist = [];
    var edgelist = [];
    var network;


    var word_id = wfGraph_getId(global_word);
    var word_neighbors_ids = wfGraph_getNeighborsNoSenses(word_id, 2);
    var total_weight = 0;

    for (var i in word_neighbors_ids) {
        total_weight += word_neighbors_ids[i].weight;
    }

    var value = $('#sel1').val();
    console.log(value);
    if ($.isNumeric(value)) {
        word_neighbors_ids = getUnique(value, word_neighbors_ids);
        console.log("found number");
    }

    push_node(nodelist, 0, global_word, word_id);
    for (var j in word_neighbors_ids) {
        add_neighbor(
            nodelist,
            edgelist,
            j+1,  // id
            wfGraph_getLabel(word_neighbors_ids[j].id),
            word_neighbors_ids[j].weight/total_weight,
            word_neighbors_ids[j].id
        )
    }

    var container = document.getElementById('mynetwork');
    container.innerHTML = "";
    container.className = "center";

    var nodes = new vis.DataSet(nodelist);
    var edges = new vis.DataSet(edgelist);
    var data = {nodes: nodes, edges: edges};
    network = new vis.Network(container, data, options);
    network.on("doubleClick", function (params) {
        centerWord(nodes.get(params["nodes"][0])["search"]);
    });

    network.setOptions
    (
        {
            physics: {enabled:false}
        }
    );

    console.log('finished network creation with no senses');
}

function centerWord(word) {

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

    if (sensesOn()) {
        console.log("regular initialize");
        initialize_network();
    }
    else {
        initialize_network_no_senses();
    }
}
