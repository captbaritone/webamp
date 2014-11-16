// Handle common file interactions
function FileManager () {
    this.reader = new FileReader()

    // Given an input node, returns a functional URL
    this.urlFromInput = function(input) {
        var file = input.files[0];
        return this.urlFromFileReference(file);
    }.bind(this)

    this.urlFromFileReference = function(fileReference) {
        return URL.createObjectURL(fileReference);
    }
}
