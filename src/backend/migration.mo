import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";

module {
  type UserProfile = {
    name : Text;
    displayName : Text;
  };

  type Message = {
    id : Text;
    sender : Principal;
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
    author : Principal;
    drawingData : Text;
    timestamp : Time.Time;
  };

  type Note = {
    id : Text;
    author : Principal;
    content : Text;
    date : Time.Time;
  };

  type Memory = {
    id : Text;
    author : Principal;
    photo : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  type Reaction = {
    type_ : ReactionType;
    user : Principal;
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
    author : Principal;
  };

  type DailyAnswer = {
    user : Principal;
    answer : Text;
    timestamp : Time.Time;
    questionId : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    messages : Map.Map<Text, Message>;
    drawings : Map.Map<Text, Drawing>;
    notes : Map.Map<Text, Note>;
    memories : Map.Map<Text, Memory>;
    questions : Map.Map<Text, DailyCheckInQuestion>;
    answers : [DailyAnswer];
    reactionHistory : [Reaction];
    heartsCount : Nat;
    hugsCount : Nat;
    kissesCount : Nat;
  };

  type NewUserProfile = {
    name : Text;
    displayName : Text;
  };

  type NewMessage = {
    id : Text;
    senderId : Principal;
    content : Text;
    timestamp : Time.Time;
    messageType : MessageType;
  };

  type NewDrawing = {
    id : Text;
    authorId : Principal;
    drawingData : Text;
    timestamp : Time.Time;
  };

  type NewNote = {
    id : Text;
    authorId : Principal;
    content : Text;
    date : Time.Time;
  };

  type NewMemory = {
    id : Text;
    authorId : Principal;
    photo : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  type NewReaction = {
    type_ : ReactionType;
    userId : Principal;
    timestamp : Time.Time;
  };

  type NewDailyCheckInQuestion = {
    id : Text;
    date : Time.Time;
    question : Text;
    authorId : Principal;
  };

  type NewDailyAnswer = {
    user : Principal;
    answer : Text;
    timestamp : Time.Time;
    questionId : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    messages : Map.Map<Text, NewMessage>;
    drawings : Map.Map<Text, NewDrawing>;
    notes : Map.Map<Text, NewNote>;
    memories : Map.Map<Text, NewMemory>;
    questions : Map.Map<Text, NewDailyCheckInQuestion>;
    answers : [NewDailyAnswer];
    reactionHistory : [NewReaction];
    heartsCount : Nat;
    hugsCount : Nat;
    kissesCount : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = Map.empty<Principal, NewUserProfile>();
    let oldUserProfilesIter = old.userProfiles.entries();
    for ((principal, userProfile) in oldUserProfilesIter) {
      newUserProfiles.add(principal, userProfile);
    };

    let newMessages = old.messages.map<Text, Message, NewMessage>(
      func(_, oldMsg) {
        {
          id = oldMsg.id;
          senderId = oldMsg.sender;
          content = oldMsg.content;
          timestamp = oldMsg.timestamp;
          messageType = oldMsg.messageType;
        };
      }
    );

    let newDrawings = old.drawings.map<Text, Drawing, NewDrawing>(
      func(_, oldDrawing) {
        {
          id = oldDrawing.id;
          authorId = oldDrawing.author;
          drawingData = oldDrawing.drawingData;
          timestamp = oldDrawing.timestamp;
        };
      }
    );

    let newNotes = old.notes.map<Text, Note, NewNote>(
      func(_, oldNote) {
        {
          id = oldNote.id;
          authorId = oldNote.author;
          content = oldNote.content;
          date = oldNote.date;
        };
      }
    );

    let newMemories = old.memories.map<Text, Memory, NewMemory>(
      func(_, oldMemory) {
        {
          id = oldMemory.id;
          authorId = oldMemory.author;
          photo = oldMemory.photo;
          caption = oldMemory.caption;
          timestamp = oldMemory.timestamp;
        };
      }
    );

    let newQuestions = old.questions.map<Text, DailyCheckInQuestion, NewDailyCheckInQuestion>(
      func(_, oldQuestion) {
        {
          id = oldQuestion.id;
          date = oldQuestion.date;
          question = oldQuestion.question;
          authorId = oldQuestion.author;
        };
      }
    );

    let newAnswers = old.answers.map(
      func(oldAnswer) {
        {
          user = oldAnswer.user;
          answer = oldAnswer.answer;
          timestamp = oldAnswer.timestamp;
          questionId = oldAnswer.questionId;
        };
      }
    );

    let newReactionHistory = old.reactionHistory.map(
      func(oldReaction) {
        {
          type_ = oldReaction.type_;
          userId = oldReaction.user;
          timestamp = oldReaction.timestamp;
        };
      }
    );

    {
      userProfiles = newUserProfiles;
      messages = newMessages;
      drawings = newDrawings;
      notes = newNotes;
      memories = newMemories;
      questions = newQuestions;
      answers = newAnswers;
      reactionHistory = newReactionHistory;
      heartsCount = old.heartsCount;
      hugsCount = old.hugsCount;
      kissesCount = old.kissesCount;
    };
  };
};
