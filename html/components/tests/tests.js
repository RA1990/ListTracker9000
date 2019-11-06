class TestError extends Error {
	constructor(className, method, message, error = null, filePath = null) {
		super(message);

		this.filePath = filePath;
		this.method = method;
		this.name = className;
		this.originalError = error;
	}

	get lineNumber(){
		if(this.originalError && this.filePath){
			const foundError = RegExp(`${this.escapedFilePath}:(\\d+)`)
				.exec(this.originalError.stack);

			return foundError && foundError[1];
		}

		return null;
	}

	get escapedFilePath(){
		if(this.filePath){
			return this.filePath.replace(/(\/|\.|\-)/g, (char) => '\\' + char);
		}

		return null;
	}

	displayError() {
		const html = `<strong>${this.name}${this.method ? `.${this.method}()` : '' } Failed Test:</strong> ${this.message}`;

		const element = $('<div>', { class: 'error errorMessage', html });
		let additionalInfo = null;

		if(this.lineNumber){
			const text = `Error occurred in ${this.filePath} on line: ${this.lineNumber}`;
			additionalInfo = $('<div>', { class: 'warning errorMessage', text});
		}

		$("#errorArea").prepend(element, additionalInfo);

		console.error(this.originalError || this);
	}
}

class SectionError {
	constructor(className) {
		this.name = className;
	}

	throw(testMethod, errorMessage) {
		throw new TestError(this.name, testMethod, errorMessage);
	}
}

function student_tests(){
	const fileName = 'components/student.js';
	const handleStudentError = handleError('Student', fileName);
	const studentError = new SectionError('Student');
	const tr = '&lt;tr&gt;';
	const td = '&lt;td&gt;';
	const button = '&lt;button&gt;';

	try {
		displayMessage(`--Testing - Student | ${fileName}`, 'header');
		if(typeof Student === 'undefined'){
			throw studentError.throw(null, 'Student object does not exist. Check components/student.js and make sure the object is still defined and there are no syntax errors in the console.');
		}

		let testVal = false;
		const testStudent1 = { id: 1, name: 'name1', course: 'course1', grade: 100 };
		const testStudent2 = { id: 2, name: 'name2', course: 'course2', grade: '50' };
		const testStudent3 = { id: 2, name: 'name3', course: 'course3', grade: '60' };

		function testCallback(input){
			return function(expectedId){
				const method = 'handleDelete';

				if (input === undefined) {
					studentError.throw(method, 'Click callback for delete button did not provide an argument of the Student id that was clicked. Click callback parameter is undefined.');
				}

				if (typeof input !== 'number') {
					studentError.throw(method, `Click callback for delete button did not provide an argument of the Student id (a number) that was clicked. Got ${JSON.stringify(input)} as a  type "${typeof input}" instead.`);
				}

				if (expectedId !== input) {
					studentError.throw(method, `Click callback for delete button had a number passed in, but it does not match expected student id. Expected "${expectedId}", but received "${input}" instead.`);
				}

				testVal = true;
			}
		}

		var student = new Student(testStudent1.id, testStudent1.name, testStudent1.course, testStudent1.grade, testCallback(testStudent1.id));
		var student2 = new Student(testStudent2.id, testStudent2.name, testStudent2.course, testStudent2.grade, testCallback(testStudent2.id));
		var student3 = new Student(testStudent3.id, testStudent3.name, testStudent3.course, testStudent3.grade, testCallback(testStudent3.id));

		displayMessage(`Student object Exists`, 'message');
		try{
			const method = 'getData';
			const hasGetData = hasMethod(student, method);

			displayMessage(`--Testing - Student.${method}() | ${fileName}`, 'header');

			if( hasGetData !== true){
				studentError.throw(method, hasGetData);
			}

			var result = student.getData();
			var result2 = student2.getData();

			if(!(result instanceof Object)){
				studentError.throw(method, 'Method did not return a standard object like it was supposed to')
			}
			if(result.id !== testStudent1.id){
				studentError.throw(method, `Student was created with an id of "${testStudent1.id}", but ${method} returned an id of "${result.id}"`);
			}
			if(result.name !== testStudent1.name){
				studentError.throw(method, `Student was created with a name of "${testStudent1.name}", but ${method} returned a name of "${result.name}"`);
			}
			if(result.course !== testStudent1.course){
				studentError.throw(method, `Student was created with a course of "${testStudent1.course}", but ${method} returned a course of "${result.course}"`);
			}
			if(result.grade != testStudent1.grade	){
				studentError.throw(method, `Student was created with a grade of "${testStudent1.grade}", but ${method} returned a grade of "${result.grade}"`);
			}
			if(typeof result.grade !== 'number'	){
				studentError.throw(method, `Student was created with a grade of type: "number", but ${method} returned a grade of type: "${typeof result.grade}"`);
			}
			if(result2.grade != testStudent2.grade	){
				studentError.throw(method, `Student was created with a grade of "${testStudent2.grade}", but ${method} returned a grade of "${result2.grade}"`);
			}
			if(typeof result2.grade!== 'number'	){
				studentError.throw(method, `Student was created with a grade of type: "string". Grade should be converted to a number, but ${method} returned a grade of type: "${typeof result2.grade}". The grade should be converted to a number in the constructor when it is saved to the grade property.`);
			}

			displayMessage(`${method} method tests passed`, 'message');
		} catch( error ){
			return handleStudentError(error, 'getData');
		}
		
		try{
			const method = 'render';
			const hasRender = hasMethod(student, method);

			displayMessage(`--Testing - Student.${method}() | ${fileName}`, 'header');

			if (hasRender !== true) {
				studentError.throw(method, hasRender);
			}

			const dom = student.render();
			$('#displayArea').append(dom);

			if($('#displayArea tr').length !== 1){
				studentError.throw(method, `Render did not return a table row, html output should have been wrapped in a table row (${tr})`);
			}

			var selectedChildren = $("#displayArea tr td")
			if(selectedChildren.length !== 4){
				studentError.throw(method, `Render should return a ${tr} that has 4 ${td} children. The returned ${tr} has ${selectedChildren.length} ${td}s`);
			}
			if(selectedChildren.eq(0).text()!==testStudent1.name){
				studentError.throw(method, `Render's first ${td} should have had the student name of "${testStudent1.name}", but it had "${selectedChildren.eq(0).text()}"`);
			}
			if(selectedChildren.eq(1).text()!==testStudent1.course){
				studentError.throw(method, `Render's second ${td} should have had the student course of "${testStudent1.course}", but it had "${selectedChildren.eq(1).text()}"`);
			}
			if(selectedChildren.eq(2).text()!=testStudent1.grade){
				studentError.throw(method, `Render's third ${td} should have had the student grade of "${testStudent1.grade}", but it had "${selectedChildren.eq(2).text()}"`);
			}
			var deleteButton = selectedChildren.eq(3).find('button');
			if(deleteButton.length!==1){
				studentError.throw(method, `Render's fourth ${td} should have had a button inside of it, but didn't`);
			}
			if(deleteButton.text().toLowerCase() !== 'delete'){
				studentError.throw(method, `Render's fourth ${td} should have had a button with the text of "delete", but had "${deleteButton.text()}" instead`);
			}

			const callbackName = 'handleDelete';
			const buttonEvents = $._data(deleteButton[0], 'events') || null;

			if (!buttonEvents || !buttonEvents.click) {
				studentError.throw(method, `The delete button does not have a click event listener applied to it. This is probably the result of ${callbackName} not being passed to the button's click handler as a callback in the render method.`);
			}

			displayMessage(`${method} method tests passed`, 'message');
		} catch( error ){
			return handleStudentError(error, 'render');
		}

		try{
			const method = 'handleDelete';
			const hasHandleDelete  = hasMethod(student, method);
			
			displayMessage(`--Testing - Student.${method}() | ${fileName}`, 'header');

			if(hasHandleDelete !== true){
				studentError.throw(method, hasHandleDelete);
			}
			
			deleteButton.click();

			if(testVal !== true){
				studentError.throw('render', `The delete button was clicked, but didn't properly execute the given callback function. You are most likely not calling this.deleteCallback from inside the ${method} method or you added the wrong callback to the button's click handler.`);
			}
			if($("#displayArea > tr").length !== 0){
				studentError.throw(method, `Student's ${tr} should be removed after delete button clicked, but it was not.`);
			}

			displayMessage(`${method} method tests passed`, 'message');
		} catch( error ){
			return handleStudentError(error, 'handleDelete');
		}

		try{
			const method = 'update';
			const hasUpdate = hasMethod(student3, method);
			const dom = student3.render();

			displayMessage(`--Testing - Student.${method}() | ${fileName}`, 'header');

			if(hasUpdate !== true){
				studentError.throw(method, hasUpdate);
			}

			$("#displayArea").append(dom);

			if($("#displayArea tr").length !== 1){
				statusError.throw(method, 'Render did not return a table row, html output should have been wrapped in a table row (tr)');
			}

			testStudent3.name = "name4";
			testStudent3.course = "course4";
			testStudent3.grade = "75";
			testStudent3.email = 'student@example.com';
			student3.update("name", testStudent3.name);
			student3.update("course", testStudent3.course);
			const updateSuccess = student3.update("grade", testStudent3.grade);
			const updateFailed = student3.update('email', testStudent3.email);

			const result = student3.getData();
			if(result.name !== testStudent3.name){
				studentError.throw(method, `Update should have updated the data property with the student name to "${testStudent3.name}", but getData returned "${result.name}"`);
			}
			if(result.course !== testStudent3.course){
				studentError.throw(method, `Update should have updated the data property with the student course to "${testStudent3.course}", but getData returned "${result.course}"`);
			}
			if(typeof result.grade !== 'number'	){
				studentError.throw(method, `Update of the student grade should have changed to type "number", but getData returned a grade of type "${typeof result.grade}" after update`);
			}
			if(result.grade!=testStudent3.grade){
				studentError.throw(method, `Update should have updated the data property with the student grade to ${testStudent3.grade}, but getData returned ${result.grade}`);
			}
			if(!updateSuccess){
				studentError.throw(method, `The update method should return <code>true</code> upon a successful update, but got <code>${updateSuccess}</code> instead`);
			}
			if(updateFailed !== false){
				studentError.throw(method, `The update method should return <code>false</code> upon a failed update, but got <code>${updateFailed}</code> instead`);
			}

			var selectedChildren = $("#displayArea tr td");

			if(selectedChildren.length !== 4){
				studentError.throw(method, `Update should not remove the <code>${tr}</code>, or any of the <code>4</code> <code>${td}</code>s in it. After calling update your <code>${tr}</code> now has <code>${selectedChildren.length}</code> <code>${td}</code>(s) in it`);
			}
			if(selectedChildren.eq(0).text() !== testStudent3.name){
				studentError.throw(method, `Update first <code>${td}</code> should now have had the student name of <code>${testStudent3.name}</code>, but it had <code>${selectedChildren.eq(0).text()}</code>`);
			}
			if(selectedChildren.eq(1).text()!==testStudent3.course){
				studentError.throw(method, `Update second <code>${td}</code> should now have had the student course of <code>${testStudent3.course}</code>, but it had <code>${selectedChildren.eq(1).text()}</code>`);
			}
			if(selectedChildren.eq(2).text()!=testStudent3.grade){
				studentError.throw(method, `Update third <code>${td}</code> should now have had the student grade of <code>${testStudent3.grade}</code>, but it had <code>${selectedChildren.eq(2).text()}</code>`);
			}

			var deleteButton = selectedChildren.eq(3).find('button');
			if(deleteButton.length!==1){
				studentError.throw(method, `Update fourth <code>${td}</code> should have had a <code>${button}</code> inside of it, but didn't`);
			}
			if(deleteButton.text().toLowerCase() !== 'delete'){
				studentError.throw(method, `Update fourth <code>${td}</code> should have had a button with text of <code>delete</code>, but had <code>${deleteButton.text()}</code>`);
			}

			deleteButton.click();

		} catch( error ){
			return handleStudentError(error, 'update');
		}

		displayMessage('Update method tests passed', 'message');
		displayMessage('Student Object Passed All Tests', 'green');

		return true;
	} catch(error) {
		handleStudentError(error);
	}
}

function sgt_tests(){
	const fileName = 'components/sgt.js';
	const handleSgtError = handleError('SGT_template', fileName);
	const sgtError = new SectionError('SGT_template');
	const tr = '&lt;tr&gt;';
	const td = '&lt;td&gt;';
	const button = '&lt;button&gt;';

	const elementList = {
		addButton: "#addButton",
		cancelButton: "#cancelButton",
		nameInput: "#studentName",
		courseInput: "#studentCourse",
		gradeInput: "#studentGrade",
		displayArea: "#displayArea",
		averageArea: ".avgGrade"
	};
	const elementSelectors = {
		addButton: $("#addButton"),
		cancelButton: $("#cancelButton"),
		nameInput: $("#studentName"),
		courseInput: $("#studentCourse"),
		gradeInput: $("#studentGrade"),
		displayArea: $("#displayArea"),
		averageArea: $(".avgGrade")
	};

	try {
		displayMessage(`--Testing - SGT_template | ${fileName}`, 'header');

		if (typeof SGT_template === 'undefined') {
			sgtError.throw(null, `<code>SGT_template</code> object does not exist. Check <code>${fileName}</code> and make sure the object is still defined and there are no syntax errors in the console`);
		}

		var testSGT = new SGT_template(elementSelectors);

		displayMessage('SGT_template Object Exists', 'message');

		try{
			const method = 'addEventHandlers';
			const hasAddEventHandlers = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if(hasAddEventHandlers !== true){
				sgtError.throw(method, hasAddEventHandlers);
			}

			testSGT.addEventHandlers();

			let eventData = $._data( $("#addButton")[0], "events" ) || null;
			let addIndex = null;

			if(eventData){
				for (addIndex = 0; addIndex < eventData.click.length; addIndex++) {
					if (eventData.click[addIndex].handler.name.indexOf('handleAdd') !== -1) {
						break;
					}
				}
			}

			if (addIndex === null || addIndex === eventData.click.length){
				sgtError.throw(method, 'Could not find <code>handleAdd</code> as a click handler on the add button');
			}

			eventData = $._data( $("#cancelButton")[0], "events" );
			let cancelIndex = null;

			if(eventData){
				for (cancelIndex = 0; cancelIndex < eventData.click.length; cancelIndex++) {
					if (eventData.click[cancelIndex].handler.name.indexOf('handleCancel') !== -1) {
						break;
					}
				}
			}

			if (cancelIndex === null || cancelIndex === eventData.click.length){
				sgtError.throw(method, 'Could not find <code>handleCancel</code> as a click handler on the cancel button');
			}

			displayMessage('addEventHandlers method passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'addEventHandlers');
		}
		
		try{
			const method = 'clearInputs';
			const hasClearInputs = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasClearInputs !== true) {
				sgtError.throw(method, hasClearInputs);
			}

			elementSelectors.nameInput.val('name');
			elementSelectors.courseInput.val('course');
			elementSelectors.gradeInput.val('grade');

			testSGT.clearInputs();

			if(elementSelectors.nameInput.val() !== ''){
				sgtError.throw(method, `Called ${method}: name input value should be <code>''</code>, but is <code>'${elementSelectors.nameInput.val()}'</code>`);
			}
			if(elementSelectors.courseInput.val() !== ''){
				sgtError.throw(method, `Called ${method}: course input value should be <code>''</code>, but is <code>'${elementSelectors.courseInput.val()}'</code>`);
			}
			if(elementSelectors.gradeInput.val() !== ''){
				sgtError.throw(method, `Called ${method}: grade input value should be <code>''</code>, but is <code>${elementSelectors.gradeInput.val()}</code>`);
			}

			elementSelectors.nameInput.val('name');
			elementSelectors.courseInput.val('course');
			elementSelectors.gradeInput.val('grade');
			elementSelectors.cancelButton.click();
			if(elementSelectors.nameInput.val() !== '' || elementSelectors.courseInput.val() !== '' || elementSelectors.gradeInput.val() !== ''){
				sgtError.throw('handleCancel', `Cancel button was pressed, but the <code>name</code>, <code>course</code>, and <code>grade</code> inputs were not cleared. Cancel button should call <code>clearInputs</code>`);
			}

			displayMessage('clearInputs and handleCancel methods passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'clearInputs');
		}
		
		try{
			const method = 'createStudent';
			const hasCreateStudent = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasCreateStudent !== true) {
				sgtError.throw(method, hasCreateStudent);
			}

			var result = testSGT.createStudent('john','math',50,1);
			if(Array.isArray(testSGT.data)){
				sgtError.throw(method, `Data property of <code>SGT_template</code> should be an <code>object</code>, but it was an <code>array</code>`);
			}
			if(testSGT.data['1'] === undefined){
				sgtError.throw(method, `<code>SGT_template</code> <code>createStudent('john','math',50,1)</code> was called.  Should have made a student with those values and added it to data. Student not found in data at key <code>1</code>`);
			}
			if(!(testSGT.data['1'] instanceof Student)){
				sgtError.throw(method, `<code>SGT_template</code> <code>createStudent('john','math',50,1)</code> was called. Should have added an object that is an instance of Student, but it was a <code>${testSGT.data['1'].constructor}</code>`);
			}
			if(result !== true){
				sgtError.throw(method, `<code>SGT_template</code> <code>createStudent</code> should have returned <code>true</code> for a successful add, but returned <code>${result}</code>`);
			}

			result = testSGT.createStudent('john2','math2',50,1);
			if(result !== false){
				sgtError.throw(method, `<code>SGT_template</code> <code>createStudent</code> should have returned <code>false</code> for trying to add a student with the same ID as an existing student, but returned <code>${result}</code>`);
			}
			var items = Object.values(testSGT.data);
			if(items.length !== 1){
				sgtError.throw(method, `<code>SGT_template</code> data should have had <code>1</code> item in it after successfully adding 1 student and failing to add the same student again, but had <code>${items.length}</code>`);
			}
			
			result = testSGT.createStudent('student3','math',50,3);
			items = Object.values(testSGT.data);
			if(items.length !== 2){
				sgtError.throw(method, `<code>SGT_template</code> was given another student <code>createStudent('student3','math',50,3)</code>, should now have <code>2</code>, but had ${items.length}`)
			}

			result = testSGT.createStudent('student4','math',50);
			items = Object.values(testSGT.data);
			if(items.length !== 3){
				sgtError.throw(method, `<code>SGT_template</code> was given another student, but with no <code>id</code>. <code>createStudent('student4','math',50)</code>, should now have <code>3</code> items, but had <code>${items.length}</code>`);
			}

			result = testSGT.createStudent('student5','math',50);
			items = Object.values(testSGT.data);
			if(items.length !== 4){
				sgtError.throw(method, `<code>SGT_template</code> was given another student, again with no <code>id</code>. <code>createStudent('student5','math',50)</code>, should now have <code>4</code> items, but had <code>${items.length}</code>`);
			}
			if(testSGT.data['4'] === undefined){
				sgtError.throw(method, `<code>SGT_template</code> was given another student with no id, but the next id slot was taken by a previous entry. It should have added this student at the next available ID of <code>4</code>, but did not`);
			}
			if(testSGT.data['4'].getData().name !== 'student5'){
				sgtError.throw(method, `<code>SGT_template</code> student was added with the following: <code>createStudent('student5','math',50)</code>. Should have had a name of <code>student5</code>, but had <code>${testSGT.data['4'].getData().name}</code>`);
			}
			if(testSGT.data['4'].getData().course!=='math'){
				sgtError.throw(method, `<code>SGT_template</code> student was added with the following: <code>createStudent('student5','math',50)</code>. Should have had a course of math, but had <code>${testSGT.data['4'].getData().course}</code>`);
			}
			if(typeof testSGT.data['4'].getData().grade !== 'number'){
				sgtError.throw(method, `<code>SGT_template</code> student was added with the following: <code>createStudent('student5','math',50)</code>. Should have had a grade of type <code>${typeof testSGT.data['4'].getData().grade}</code>`);
			}
			if(testSGT.data['4'].getData().grade !== 50){
				sgtError.throw(method, `<code>SGT_template</code student was added with the following: <code>createStudent('student5','math',50)</code>. Should have had a grade of number <code>50</code>, but had <code>${testSGT.data['4'].getData().grade}</code>`);
			}

			elementSelectors.nameInput.val('name');
			elementSelectors.courseInput.val('course');
			elementSelectors.gradeInput.val(100);
			elementSelectors.addButton.click();
			items = Object.values(testSGT.data);
			const method2 = 'handleAdd';
			
			var dom = $("#displayArea > tr:nth-of-type(5)");
			if(items.length !== 5){
				sgtError.throw(method2, `<code>SGT_template</code> <code>createStudent</code> should have been triggered by button <code>add</code> being clicked. Either function wasn't triggered, or <code>createStudent</code> didn't get proper data from inputs`);
			}

			var studentData = testSGT.data[5].getData();
			
			if(studentData.name !== 'name'){
				sgtError.throw(method2, `Name input had <code>'name'</code> in it when add was clicked, but created Student has a name of <code>${studentData.name}</code>`);
			}
			if(studentData.course!=='course'){
				sgtError.throw(method2, `Course input had <code>'course'</code> in it when add was clicked, but created Student has a course of <code>${studentData.course}</code>`);
			}
			if(studentData.grade !== 100){
				sgtError.throw(method2, `Grade input had <code>100</code> in it when add was clicked, but created Student has a grade of <code>${studentData.grade}</code>`);
			}

			displayMessage('createStudent method passed','message');
		} catch( error ){
			return handleSgtError(error, 'createStudent');
		}
		
		try{
			const method = 'doesStudentExist';
			const hasDoesStudentExist = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasDoesStudentExist !== true) {
				sgtError.throw(method, hasDoesStudentExist);
			}

			const student3Exists = testSGT.doesStudentExist(3);
			if(student3Exists !== true){
				sgtError.throw(method, `Student id <code>3</code> should exist, but <code>doesStudentExist</code> returned <code>${student3Exists}</code>`);
			}
			if(testSGT.doesStudentExist(40)!==false){
				throw new Error(`Student id 40 was checked.  Should not exist, but doesStudentExist returned`);
			}
			//still need to test if there is 0 students... guess I could test that when I delete all students

			displayMessage('doesStudentExist method passed','message');
		} catch( error ){
			return handleSgtError(error, 'doesStudentExist');
		}

		try{
			const method = 'readStudent';
			const hasReadStudent = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasReadStudent !== true) {
				sgtError.throw(method, hasReadStudent);
			}

			var pulledStudent = testSGT.readStudent(3);
			if(pulledStudent === undefined){
				sgtError.throw(method, `<code>${method}</code> should return a Student when an ID is passed in, but got <code>${JSON.stringify(pulledStudent)}</code> instead`);
			}

			if(pulledStudent.constructor !== Student){
				sgtError.throw(method, `<code>readStudent(3)</code> should have returned a Student object, but returned <code>${pulledStudent.constructor}</code>`);
			}
			if(pulledStudent.getData().name !== 'student3'){
				sgtError.throw(method, `<code>readStudent(3)</code> should have returned a student with a name of <code>student3</code>, but had <code>${pulledStudent.getData().name}</code>`);
			}
			if(pulledStudent.getData().course !== 'math'){
				sgtError.throw(method, `<code>readStudent(3)</code> should have returned a student with a course of <code>math</code>, but had <code>${pulledStudent.getData().course}</code>`);
			}
			if(pulledStudent.getData().grade !== 50){
				sgtError.throw(method, `<code>readStudent(3)</code> should have returned a student with a grade of <code>50</code>, but had <code>${pulledStudent.getData().grade}</code>`);
			}
			if(pulledStudent.getData().id != 3){
				sgtError.throw(method, `<code>readStudent(3)</code> should have returned a student with a id of <code>3</code>, but had <code>${pulledStudent.getData().id}</code>`);
			}
			if(testSGT.readStudent(40) !== false){
				sgtError.throw(method, `<code>readStudent(40)</code> should have returned <code>false</code>, as no student by that id exists.  It returned <code>${testSGT.readStudent(40)}</code>`);
			}

			var allStudents = testSGT.readStudent();
			if(!Array.isArray(allStudents)){
				sgtError.throw(method, `<code>readStudent()</code> (with no id given) should have returned an array of students.  It returned <code>${JSON.stringify(allStudents, null, 2)}</code>`);
			}
			if(allStudents.length !== 5){
				sgtError.throw(method, `<code>readStudent()</code> (with no id given) should have returned an array of 5 elements (as there are 5 students added) it had <code>${allStudents.length}</code> elements`);
			}
			if(allStudents[0].constructor !== Student){
				sgtError.throw(method, `<code>readStudent()</code> (with no id given) should have returned an array of 5 students (Student objects), but they were <code>${allStudents[0].constructor}</code> constructed`);
			}

			displayMessage('readStudent method passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'doesStudentExist');
		}

		try{
			const method = 'displayAllStudents';
			const hasDisplayAllStudents = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasDisplayAllStudents !== true) {
				sgtError.throw(method, hasDisplayAllStudents);
			}

			elementSelectors.nameInput.val('name2');
			elementSelectors.courseInput.val('course2');
			elementSelectors.gradeInput.val(99);
			elementSelectors.addButton.click();
			items = Object.values(testSGT.data);

			testSGT.displayAllStudents();

			var dom = $("#displayArea > tr:nth-of-type(1)");
			var result = dom.find('td:nth-of-type(1)').text();
			if(result !== 'john'){
				//TODO Might want to add something that says ("check your display all students method");
				sgtError.throw(method, `Name input had <code>'john'</code> in it when add was clicked, but created Student dom element has a name of <code>${result}</code>`);
			}

			var result = dom.find('td:nth-of-type(2)').text()
			if(result !== 'math'){
				sgtError.throw(method, `Course input had <code>'math'</code> in it when add was clicked, but created Student dom element has a course of <code>${result}</code>`);
			}

			var result = dom.find('td:nth-of-type(3)').text()
			if(result !== '50'){
				sgtError.throw(method, `Grade input had <code>50</code> in it when add was clicked, but created Student dom element has a grade of <code>${result}</code>`);
			}

			var dom = $("#displayArea > tr:nth-of-type(6)");
			var result = dom.find('td:nth-of-type(1)').text()
			if(result !== 'name2'){
				sgtError.throw(method, `Name input had <code>'name2'</code> in it when add was clicked, but created Student dom element has a name of <code>${result}</code>`);
			}

			var result = dom.find('td:nth-of-type(2)').text()
			if(result !== 'course2'){
				sgtError.throw(method, `Course input had <code>'course2'</code> in it when add was clicked, but created Student dom element has a course of <code>${result}</code>`);
			}

			var result = dom.find('td:nth-of-type(3)').text()
			if(result !== '99'){
				sgtError.throw(method, `Grade input had <code>99</code> in it when add was clicked, but created Student dom element has a grade of <code>${result}</code>`);
			}

			var rows = $("#displayArea > tr")
			$(rows[3]).remove();
			if( rows.length !== 6){
				sgtError.throw(method, `<code>6</code> students have been added. There should be <code>6</code> students present on the dom in <code>${tr}</code> elements, but found <code>${rows.length}</code>`);
			}

			displayMessage('displayAllStudents method passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'displayAllStudents');
		}

		try{
			const method = 'displayAverage';
			const hasDisplayAverage = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasDisplayAverage !== true) {
				sgtError.throw(method, hasDisplayAverage);
			}

			if(parseFloat(elementSelectors.averageArea.eq(0).text()) != 66.5){
				sgtError.throw(method, `Average area should have had a value of <code>66.5</code> after being stripped of extra zeros, but had an average of <code>${elementSelectors.averageArea.eq(0).text()}</code>. Did you calculate the average incorrectly?`);
			}
			if(elementSelectors.averageArea.eq(0).text() !== '66.50'){
				sgtError.throw(method, `Average area should have had a value of <code>'66.50'</code>, but had <code>'66.5'</code>. Make sure you used <code>toFixed(2)</code> on output to fix the precision of the output`);
			}

			displayMessage('displayAverage method passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'displayAverage');
		}

		try{
			const method = 'deleteStudent';
			const hasDeleteStudent = hasMethod(testSGT, method);

			displayMessage(`--Testing - SGT_template.${method} | ${fileName}`, 'header');

			if (hasDeleteStudent !== true) {
				sgtError.throw(method, hasDeleteStudent);
			}

			var result = testSGT.deleteStudent(100);
			if(result!== false){
				sgtError.throw(method, `<code>deleteStudent(100)</code> should have returned <code>false</code> because there is no student by ID 100. It returned <code>${result}</code>`);
			}

			testSGT.createStudent('delete name','delete class',100,40,function(){});
			var allStudents = testSGT.readStudent();
			result = testSGT.deleteStudent(40);
			if(result !== true){
				sgtError.throw(method, `A new student with ID 40 was added. <code>deleteStudent(40)</code> was called. It should have returned <code>true</code> after deleting the student successfully. It returned <code>${result}</code>`);
			}

			var afterAllStudents = testSGT.readStudent();
			if(allStudents.length === afterAllStudents.length){
				sgtError.throw(method, `After <code>deleteStudent(40)</code> ran, students should only have <code>${allStudents.length-1}</code>, but it had <code>${afterAllStudents.length}</code>`);
			}

			displayMessage('deleteStudent method passed', 'message');
		} catch( error ){
			return handleSgtError(error, 'deleteStudent');
		}

		try{
			displayMessage(`--Testing - Delete Button Click`, 'header');

			var beforeAllStudents = testSGT.readStudent();
			$buttons = $("#displayArea tr button");
			$($buttons[3]).click();
			var afterAllStudents = testSGT.readStudent();
			if($("#displayArea tr").length === 5){
				sgtError.throw(null, `Delete button on fourth student <code>"name"</code> was clicked, but a row wasn't deleted`);
			}
			if(beforeAllStudents.length === afterAllStudents.length){
				sgtError.throw(null, `Delete button on fourth student <code>"name"</code> was clicked, but there are still <code>${beforeAllStudents.length}</code> students in the SGT `);
			}
			if($("#displayArea tr td").eq(0).text()==='student3'){
				sgtError.throw(null, `Delete button on fourth student <code>"name"</code> was clicked, but still reading that a student with name <code>'student3'</code> is in the dom`);
			}

			displayMessage('Delete Button Click passed', 'message');
		} catch( error ){
			return handleSgtError(error);
		}
		
		displayMessage('SGT_template object passed all tests', 'green');
		return true;
	} catch(error) {
		handleSgtError(error);
	}
}

function handleError(className = null, filePath = null) {
	return function (error, method = null) {
		if (error instanceof TestError) {
			return error.displayError();
		}

		const userMessage = 'This is most likely an error caused by your code';

		if (className) {
			const testError = new TestError(className, method, `${error.message} | ${userMessage}`, error, filePath);

			return testError.displayError();
		}

		displayMessage([userMessage, error]);
	}
}

function startTests(){
	$(".errorMessage").remove();
	$('#displayArea').html('');
	var testFunctions = ['student_tests', 'sgt_tests'];
	var i = 0;
	while( i<testFunctions.length){
		if (!window[testFunctions[i]]())
			return;
		i++;
	}
	displayMessage(' All tests passed! ', 'header');
}


function displayMessage(message, type='error'){
	showModal();
	if(Array.isArray(message)){
		var wholeMessage = message.join(': ');
		var modalMessage = message[1];
	} else {
		wholeMessage = modalMessage = message;
	}



	if(modalMessage instanceof Error){
		// debugger;
		// var stackOutput = {};
		// Error.captureStackTrace(stackOutput, modalMessage);
		// var lineNumber = /tests\.js:(\d+)/.exec(stackOutput.stack)[1];
		// var preppedMessage = `tests.js: line ${lineNumber} ${modalMessage}`;
		console.error(modalMessage);
		preppedMessage = modalMessage;
		var advisor = $("<div>").text('CHECK CONSOLE FOR MORE INFO.').addClass('errorMessage')
	} else {
		preppedMessage = modalMessage;
		console.log(wholeMessage);
		advisor = '';
	}
	var element = $("<div>").text(preppedMessage).addClass(type + ' errorMessage');

	$("#errorArea").prepend(element, advisor);
}

function hasMethod(object, method){
	const name = object.constructor.name;

	if (object[method] === undefined) {
		return `Missing <code>${method}</code> method in <code>${name}</code>.`;
	}

	if(typeof object[method] !== 'function') {
		return `<code>${name}</code> has a property named <code>${method}</code> but it is not a method. Expected <code>${name}.${method}</code> to be a method.`;
	}

	return true;
}

function testMethod( object, method ){
	try{
		if(object[method] === undefined){
			throw( new Error('missing method '+method+' in ' + object.constructor.name));
		}
	}
	catch (error){
		displayMessage(error);
		return false;
	}
}
var shadow;
var displayModal;
var modalContents;
var minimizeButton;
function intiateTestDisplay(){
	shadow = $("<div>",{
		css: {
			'background-color': 'rgba(0,0,0,.4)',
			position: 'fixed',
			left: 0,
			top: 0,
			height: '100vh',
			width: '100vw',
		}
	})
	shadow.hide();
	displayModal = $("<div>",{
		css: {

		},
		id:'errorArea',
	})
	modalContents = $("<div>",{
		class: 'modalContainer'
	})
	modalContents.append(displayModal);

	runTestButton = $("<div>",{
		text: 'RUN',
		'class': 'runTestButton',
		on: {
			click: startTests
		}
	})
	minimizeButton = $("<div>",{
		text: '^',
		css: {
		},
		'class': 'minimizeButton',
		on: {
			click: hideModal
		}
	})
	modalContents.append(runTestButton);
	//modalContainer.hide();
	$('body').append( minimizeButton, modalContents );
	showModal();
}
function showModal(){
	minimizeButton.appendTo(modalContents);
	modalContents.show();
	minimizeButton.text('^').off('click', showModal).on('click', hideModal)
	//shadow.show();
}
function hideModal(){
	minimizeButton.appendTo('body');
	minimizeButton.text('v').off('click', hideModal).on('click', showModal)
	modalContents.hide();
	//shadow.hide();
}
