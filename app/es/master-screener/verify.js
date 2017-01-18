module.exports = {
  verify
};

/* IS THIS REALLY NEEDED ??? */


function verify(masterScreener) {
  if (masterScreener === undefined ){
    throw new Error('masterScreener is undefined');
  }
  if (masterScreener.questions === undefined || !(Array.isArray(masterScreener.questions)))  {
    throw new Error('masterScreener questions are not well formed');
  }
  if (masterScreener.meta === undefined){
    throw new Error('masterScreener meta is undefined');
  }
  if (masterScreener.meta.questions === undefined || masterScreener.meta.questions.totalCount === undefined){
    throw new Error('masterScreener.meta.questions.totalCount is undefined');
  }
  if (typeof masterScreener.meta.questions.totalCount !== 'number'){
    throw new Error('masterScreener.meta.questions.totalCount should be a number');
  }
  if (masterScreener.meta.screener === undefined){
    throw new Error('masterScreener.meta.screener is undefined');
  }
  if (masterScreener.meta.screener.version === undefined || typeof masterScreener.meta.screener.version !== 'number'){
    throw new Error('masterScreener.meta.screener.version is invalid');
  }
  verifyQuestions(masterScreener.questions);
}

function verifyQuestions(questions) {
  questions.forEach( (question, index) => {
    if (question.type === undefined) {
      throw new Error(`question #${index} type is undefined`);
    }
    switch(question.type){
      case 'number': {
        verifyNumberQuestion(question, index);
        break;
      }
      case 'boolean': {
        verifyBoolQuestion(question, index);
        break;
      }
      default: {
        throw new Error(`question #${index} has an unrecognized type`);
      }
    }
    verifySharedQuestionProps(question, index);
  });
}

function verifyNumberQuestion(question, index){
  if (question.value === undefined || typeof question.value !== 'number') {
    //throw new Error(`question of type number @ index ${index} has an improper value`);
  }
}

function verifyBoolQuestion(question, index){
  if (question.options === undefined || !Array.isArray(question.options)) {
    throw new Error(`question of type boolean @ index ${index} has improper options`);
  }
  const verifyOptions = () => {
    question.options.forEach( (option, optIndex) => {
      if(option.display === undefined || typeof option.display !== 'string'){
        throw new Error(`question @index ${index} has an option with improper display @optionIndex ${optIndex}`);
      }
      if (option.value === undefined || typeof option.value !== 'boolean'){
        throw new Error(`question @index ${index} has an option with improper value @optionIndex ${optIndex}`);
      }
    });
  };
  verifyOptions();
}



function verifySharedQuestionProps(question, index){
  if (question.label === undefined || typeof question.label !== 'string') {
    throw new Error(`question @index ${index} has an invalid label`);
  }
  if (question.expandable === undefined || typeof question.expandable !== 'boolean'){
    throw new Error(`question @index ${index} has an invalid expandable`);
  }
  if (question.expandable === true) {
    verifyConditionalQuestions(question, index);
  }
  if (question.key === undefined || typeof question.key !== 'string') {
    throw new Error(`question @index ${index} has an invalid key`);
  }
  if (question.controlType === undefined || !( (question.controlType !== 'radio' || question.controlType !== 'input')) ){
    throw new Error(`question @index ${index} has an invalid control type`);
  }
}

function verifyConditionalQuestions(question, index){
  if (question.conditonalQuestions === undefined || !Array.isArray(question.conditonalQuestions)) {
    throw new Error(`question @index ${index} is expandable without a valid conditional question array`);
  }
  if (question.conditonalQuestions.length === 0) {
    throw new Error(`question @index ${index} is expandable with 0 conditional questions`);
  }
  verifyQuestions(question.conditonalQuestions);
}
