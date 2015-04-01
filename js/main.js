window.addEventListener('DOMContentLoaded', function() {
	
	// Lexical highlighting, if available
	var codeEditor;
	if (typeof CodeMirror === 'function') {
		codeEditor = new CodeMirror(document.querySelector("#codeEditor"), {
			mode: 'applebasic',
			tabMode: 'default',
			content: $('#sourceCode').value,
			height: '100%'
		});
		codeOutput = new CodeMirror(document.querySelector("#codeOutput"), {
			mode: 'markdown',
			tabMode: 'default',
			content: $('#outputValue').value,
			height: '100%'
		});
	} else {
		// do nothing for now
	}

	function getSource() {
		return codeEditor ? codeEditor.getValue() : "";
	}

	function setSource(source) {
		if (codeEditor) {
			codeEditor.setValue(source);
		}
	}

	var program;
	$('#btnRunProgram').click(function (event) {
		if(true) {
		try {
				applebasic.compile(getSource(), codeOutput);
			} catch(err) {
				alert(err);
			}
		} else {
			applebasic.compile(getSource(), codeOutput);
		}
	});

});
