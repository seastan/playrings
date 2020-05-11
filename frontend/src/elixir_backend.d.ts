declare module "elixir-backend" {
  export type Seat = "west" | "east" | "south" | "north";
  export type Winner = null | "north_south" | "east_west";
  export type SittingPlayer = null | number | "bot";

  export declare class Room {
    public id: number;
    public name: string;
    public slug: string;
    public west: null | number;
    public east: null | number;
    public north: null | number;
    public south: null | number;
  }

  export declare class GameUIView {
    public game_ui: GameUI;
    public my_hand: Array<Card>;
    public my_seat: null | Seat;
  }

  export declare class Card {
    public rank: number;
    public suit: "s" | "c" | "h" | "d";
    public table_x: number;
    public table_y: number;
  }

  export declare class Group {
    name: string;
    type: string;
    controller: string;
    cards: Array<Card>;
  }

  export declare class Groups {
    gSharedQuest: Group;
    gSharedQuestDiscard: Group;
    gSharedEncounter: Group;
    gSharedEncounterDiscard: Group;
    gSharedQuest2: Group;
    gSharedQuestDiscard2: Group;
    gSharedEncounter2: Group;
    gSharedEncounterDiscard2: Group;
    gSharedOther: Group;
    gPlayer1Hand: Group;
    gPlayer1Deck: Group;
    gPlayer1Discard: Group;
    gPlayer1Sideboard: Group;
    gPlayer2Hand: Group;
    gPlayer2Deck: Group;
    gPlayer2Discard: Group;
    gPlayer2Sideboard: Group;
    gPlayer3Hand: Group;
    gPlayer3Deck: Group;
    gPlayer3Discard: Group;
    gPlayer3Sideboard: Group;
    gPlayer4Hand: Group;
    gPlayer4Deck: Group;
    gPlayer4Discard: Group;
    gPlayer4Sideboard: Group;
  }

  export declare class Column {
    controller: string;
    cards: Array<Card>;
  }

  export declare class DragEvent {
    public element: HTMLElement;
  }

  export declare class GameUI {
    created_at: any;
    game: Game;
    game_name: string;
    options: any;
    seats: GameUISeats;
    status: "staging" | "playing" | "done";
    when_seats_full: null | string; // timestamp
  }

  export declare class GameUISeats {
    east: GameUISeat;
    west: GameUISeat;
    north: GameUISeat;
    south: GameUISeat;
  }

  export declare class GameUISeat {
    sitting: SittingPlayer;
    recently_sitting: SittingPlayer;
    when_left_seat: null | string; // Actually contains a timestamp
  }

  export declare class Game {
    dealer: string; // "north"
    east: any; // GamePlayer
    game_name: string;
    north: any; // GamePlayer
    options: any;
    south: any; // GamePlayer
    spades_broken: boolean;
    status: "bidding" | "playing";
    trick: Array<TrickCard>;
    turn: null | Seat;
    west: any; // GamePlayer
    when_trick_full: null | string; // timestamp
    score: GameScore;
    round_number: number;
    winner: Winner;
    drag_id: string;
    drag_x: number;
    drag_y: number;
    columns: Array<Column>;
    groups: Groups;
  }

  export declare class GamePlayer {
    bid: null | number;
    hand: Array<Card>;
    tricks_won: number;
  }

  export declare class GameScore {
    north_south_rounds: Array<GameScoreRoundTeam>;
    north_south_score: number;
    east_west_rounds: Array<GameScoreRoundTeam>;
    east_west_score: number;
  }

  export declare class GameScoreRoundTeam {
    before_score: number;
    before_bags: number;
    bid: number;
    won: number;
    adj_successful_nil: number;
    adj_failed_nil: number;
    adj_successful_bid: number;
    adj_failed_bid: number;
    adj_bags: number;
    bag_penalty: number;
    after_score: number;
    after_bags: number;
  }

  // game_ui.game.trick --> array TrickCard
  export declare class TrickCard {
    card: Card;
    seat: Seat;
  }

  export declare class RotateTableContextType {
    bottomSeat: Seat;
    topSeat: Seat;
    rightSeat: Seat;
    leftSeat: Seat;
    bottomPlayer: GamePlayer;
    topPlayer: GamePlayer;
    rightPlayer: GamePlayer;
    leftPlayer: GamePlayer;
    bottomUserId: SittingPlayer;
    topUserId: SittingPlayer;
    rightUserId: SittingPlayer;
    leftUserId: SittingPlayer;
  }

  // Profile: Private information about your own account.
  export declare class Profile {
    public id: number;
    public email: string;
    public alias: string;
    public inserted_at: string; // Actually contains a timestamp
    public email_confirmed_at: null | string; // Actually contains a timestamp
  }

  // User: Public information about other users.
  export declare class User {
    public id: number;
    public alias: string;
  }

  export declare class ChatMessage {
    public text: string;
    public sent_by: number | null;
    public when: string; // Actually a timestamp
    public shortcode: string;
  }
}
