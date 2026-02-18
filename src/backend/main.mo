import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage mixin for blob management
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    displayName : Text;
  };

  type Message = {
    id : Text;
    senderId : ?Principal;
    content : Text;
    timestamp : Time.Time;
    messageType : MessageType;
  };

  type MessageType = {
    #text;
    #emoji : Text;
    #gifUrl : Text;
  };

  type Drawing = {
    id : Text;
    authorId : Principal;
    drawingData : Text;
    timestamp : Time.Time;
  };

  type Note = {
    id : Text;
    authorId : Principal;
    content : Text;
    date : Time.Time;
  };

  type Memory = {
    id : Text;
    authorId : Principal;
    photo : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  type Reaction = {
    type_ : ReactionType;
    userId : Principal;
    timestamp : Time.Time;
  };

  type ReactionType = {
    #heart;
    #hug;
    #kiss;
  };

  type DailyCheckInQuestion = {
    id : Text;
    date : Time.Time;
    question : Text;
    authorId : Principal;
  };

  public type DailyAnswer = {
    user : Principal;
    answer : Text;
    timestamp : Time.Time;
    questionId : Text;
  };

  var userProfiles = Map.empty<Principal, UserProfile>();
  var messages = Map.empty<Text, Message>();
  var drawings = Map.empty<Text, Drawing>();
  var notes = Map.empty<Text, Note>();
  var memories = Map.empty<Text, Memory>();
  var questions = Map.empty<Text, DailyCheckInQuestion>();
  var scheduledQuestions = Map.empty<Text, DailyCheckInQuestion>();

  var answers : [DailyAnswer] = [];
  var reactionHistory : [Reaction] = [];

  var heartsCount = 0;
  var hugsCount = 0;
  var kissesCount = 0;

  func generateId(prefix : Text) : Text {
    prefix # "_" # debug_time(Time.now());
  };

  func debug_time(timestamp : Time.Time) : Text {
    timestamp.toText();
  };

  // User Profile Management - Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Chat/Message system
  public shared ({ caller }) func sendMessage(content : Text, messageType : MessageType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let messageId = generateId("msg");
    let message : Message = {
      id = messageId;
      senderId = ?caller;
      content;
      timestamp = Time.now();
      messageType;
    };

    messages.add(messageId, message);
    messageId;
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.values().toArray();
  };

  // Doodle/Drawings system
  public shared ({ caller }) func saveDrawing(drawingData : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save drawings");
    };

    let drawingId = generateId("draw");
    let drawing : Drawing = {
      id = drawingId;
      authorId = caller;
      drawingData;
      timestamp = Time.now();
    };

    drawings.add(drawingId, drawing);
    drawingId;
  };

  public query ({ caller }) func getAllDrawings() : async [Drawing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view drawings");
    };
    drawings.values().toArray();
  };

  // Daily Notes system
  public shared ({ caller }) func saveNote(content : Text, date : Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save notes");
    };

    let noteId = generateId("note");
    let note : Note = {
      id = noteId;
      authorId = caller;
      content;
      date;
    };

    notes.add(noteId, note);
    noteId;
  };

  public shared ({ caller }) func updateNote(noteId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notes");
    };

    switch (notes.get(noteId)) {
      case (null) {
        Runtime.trap("Note not found");
      };
      case (?existingNote) {
        if (existingNote.authorId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own notes");
        };

        let updatedNote : Note = {
          id = existingNote.id;
          authorId = existingNote.authorId;
          content;
          date = existingNote.date;
        };
        notes.add(noteId, updatedNote);
      };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    notes.values().toArray();
  };

  // Memory Wall (Photo Uploads)
  public shared ({ caller }) func saveMemory(photo : Storage.ExternalBlob, caption : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save memories");
    };

    let memoryId = generateId("memory");
    let memory : Memory = {
      id = memoryId;
      authorId = caller;
      photo;
      caption;
      timestamp = Time.now();
    };

    memories.add(memoryId, memory);
    memoryId;
  };

  public query ({ caller }) func getAllMemories() : async [Memory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view memories");
    };
    memories.values().toArray();
  };

  // Mood Reactions
  public shared ({ caller }) func addReaction(reactionType : ReactionType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reactions");
    };

    let reaction : Reaction = {
      type_ = reactionType;
      userId = caller;
      timestamp = Time.now();
    };

    let newHistory = ([reaction]).concat(reactionHistory);
    if (newHistory.size() > 50) {
      reactionHistory := newHistory.sliceToArray(0, 50);
    } else {
      reactionHistory := newHistory;
    };

    switch (reactionType) {
      case (#heart) { heartsCount += 1 };
      case (#hug) { hugsCount += 1 };
      case (#kiss) { kissesCount += 1 };
    };
  };

  public query ({ caller }) func getReactionCounts() : async { hearts : Nat; hugs : Nat; kisses : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reaction counts");
    };
    {
      hearts = heartsCount;
      hugs = hugsCount;
      kisses = kissesCount;
    };
  };

  public query ({ caller }) func getRecentReactions() : async [Reaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reactions");
    };
    reactionHistory;
  };

  // Daily Check-In Features

  public shared ({ caller }) func addDailyQuestion(question : Text, date : Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };

    let questionId = generateId("question");
    let dailyQuestion : DailyCheckInQuestion = {
      id = questionId;
      question;
      date;
      authorId = caller;
    };
    questions.add(questionId, dailyQuestion);
    questionId;
  };

  public shared ({ caller }) func updateDailyQuestion(questionId : Text, question : Text, date : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update questions");
    };

    switch (questions.get(questionId)) {
      case (null) {
        Runtime.trap("Question not found");
      };
      case (?existingQuestion) {
        if (existingQuestion.authorId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own questions");
        };

        let updatedQuestion : DailyCheckInQuestion = {
          id = existingQuestion.id;
          question;
          date;
          authorId = existingQuestion.authorId;
        };
        questions.add(questionId, updatedQuestion);
      };
    };
  };

  // Method to get today's question, generating one from the schedule if needed
  public query ({ caller }) func getTodaysQuestion() : async ?DailyCheckInQuestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };

    let today = Time.now();
    let questionsIter = questions.values();
    let todaysQuestion = questionsIter.find(
      func(q) { q.date <= today + 86400 }
    );
    todaysQuestion;
  };

  // Method to force regenerate today's question from the schedule
  public shared ({ caller }) func regenerateTodaysQuestion() : async ?DailyCheckInQuestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can regenerate questions");
    };

    let today = Time.now();

    // Find the earliest scheduled question that is not in the past
    let scheduledIter = scheduledQuestions.values();
    let nextQuestion = scheduledIter.find(
      func(q) { q.date >= today }
    );

    switch (nextQuestion) {
      case (null) { null };
      case (?question) {
        // Add the question to the main questions map as today's question
        questions.add(question.id, question);

        // Remove it from the schedule
        scheduledQuestions.remove(question.id);

        ?question;
      };
    };
  };

  public query ({ caller }) func getQuestionById(questionId : Text) : async ?DailyCheckInQuestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.get(questionId);
  };

  public query ({ caller }) func getAllQuestions() : async [DailyCheckInQuestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray();
  };

  public query ({ caller }) func getAllScheduledQuestions() : async [DailyCheckInQuestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view scheduled questions");
    };
    scheduledQuestions.values().toArray();
  };

  public shared ({ caller }) func submitDailyAnswer(answer : Text, questionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };

    let newAnswer : DailyAnswer = {
      user = caller;
      answer;
      timestamp = Time.now();
      questionId;
    };

    let filteredAnswers = answers.filter(
      func(a) {
        not (a.user == caller and a.questionId == questionId);
      }
    );
    answers := ([newAnswer]).concat(filteredAnswers);
  };

  public query ({ caller }) func hasSubmittedAnswer(questionId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check answer status");
    };

    answers.any(
      func(a) { a.user == caller and a.questionId == questionId }
    );
  };

  public query ({ caller }) func getAnsweredDays() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view answered days");
    };

    let answeredDays = answers.filter(
      func(a) { a.user == caller }
    ).map(func(a) { a.questionId });
    answeredDays;
  };

  public query ({ caller }) func getAnswersForQuestion(questionId : Text) : async ?{ currentUserAnswer : ?DailyAnswer; otherUserAnswer : ?DailyAnswer } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view answers");
    };

    let answersIter = answers.values();
    var currentUserAnswer : ?DailyAnswer = null;
    var otherUserAnswer : ?DailyAnswer = null;

    for (answer in answersIter) {
      if (answer.user == caller and answer.questionId == questionId) {
        currentUserAnswer := ?answer;
      } else if (answer.questionId == questionId) {
        otherUserAnswer := ?answer;
      };
    };

    if (currentUserAnswer.isSome() or otherUserAnswer.isSome()) {
      ?{
        currentUserAnswer;
        otherUserAnswer;
      };
    } else {
      null;
    };
  };

  public query ({ caller }) func getPastQuestions() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view past questions");
    };

    let uniqueQuestionsIter = answers.filter(func(a) { a.user == caller }).values();
    let uniqueQuestionsArray = uniqueQuestionsIter.map(func(a) { a.questionId }).toArray();
    uniqueQuestionsArray;
  };
};
