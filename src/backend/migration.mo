import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
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

  type DailyAnswer = {
    user : Principal;
    answer : Text;
    timestamp : Time.Time;
    questionId : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; displayName : Text }>;
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

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; displayName : Text }>;
    messages : Map.Map<Text, Message>;
    drawings : Map.Map<Text, Drawing>;
    notes : Map.Map<Text, Note>;
    memories : Map.Map<Text, Memory>;
    questions : Map.Map<Text, DailyCheckInQuestion>;
    scheduledQuestions : Map.Map<Text, DailyCheckInQuestion>;
    answers : [DailyAnswer];
    reactionHistory : [Reaction];
    heartsCount : Nat;
    hugsCount : Nat;
    kissesCount : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      scheduledQuestions = Map.empty<Text, DailyCheckInQuestion>()
    };
  };
};
