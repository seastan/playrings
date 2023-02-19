defmodule DragnCardsGame.Groups do
  @moduledoc """

  """
  alias DragnCardsGame.{Groups,Group}

  @type t :: Map.t()

  @doc """
  """
  @spec new() :: Map.t()
  def new() do
    %{
      "sharedQuestDeck"=>         Group.new("sharedQuestDeck","discard","shared"),
      "sharedQuestDiscard"=>      Group.new("sharedQuestDiscard","deck","shared"),
      "sharedEncounterDeck"=>     Group.new("sharedEncounterDeck","deck","shared"),
      "sharedEncounterDiscard"=>  Group.new("sharedEncounterDiscard","discard","shared"),
      "sharedQuestDeck2"=>        Group.new("sharedQuestDeck2","discard","shared"),
      "sharedQuestDiscard2"=>     Group.new("sharedQuestDiscard2","deck","shared"),
      "sharedEncounterDeck2"=>    Group.new("sharedEncounterDeck2","deck","shared"),
      "sharedEncounterDiscard2"=> Group.new("sharedEncounterDiscard2","discard","shared"),
      "sharedEncounterDeck3"=>    Group.new("sharedEncounterDeck3","deck","shared"),
      "sharedEncounterDiscard3"=> Group.new("sharedEncounterDiscard3","discard","shared"),
      "sharedOther"=>             Group.new("sharedOther","discard","shared"),
      "sharedSetAside"=>          Group.new("sharedSetAside","discard","shared"),
      "sharedVictory"=>           Group.new("sharedVictory","discard","shared"),
      "sharedStaging"=>           Group.new("sharedStaging","play","shared"),
      "sharedActive"=>            Group.new("sharedActive","play","shared"),
      "sharedMainQuest"=>         Group.new("sharedMainQuest","play","shared"),
      "sharedExtra1"=>            Group.new("sharedExtra1","play","shared"),
      "sharedExtra2"=>            Group.new("sharedExtra2","play","shared"),
      "sharedExtra3"=>            Group.new("sharedExtra3","play","shared"),
      "sharedExtra4"=>            Group.new("sharedExtra4","play","shared"),
      "player1Hand"=>             Group.new("player1Hand","hand","player1"),
      "player1Deck"=>             Group.new("player1Deck","deck","player1"),
      "player1Discard"=>          Group.new("player1Discard","discard","player1"),
      "player1Sideboard"=>        Group.new("player1Sideboard","discard","player1"),
      "player1Deck2"=>            Group.new("player1Deck2","deck","player1"),
      "player1Play1"=>            Group.new("player1Play1","play","player1"),
      "player1Play2"=>            Group.new("player1Play2","play","player1"),
      "player1Play3"=>            Group.new("player1Play3","play","player1"),
      "player1Play4"=>            Group.new("player1Play4","play","player1"),
      "player1Engaged"=>          Group.new("player1Engaged","play","shared"),
      "player1Event"=>            Group.new("player1Event","play","player1"),
      "player2Hand"=>             Group.new("player2Hand","hand","player2"),
      "player2Deck"=>             Group.new("player2Deck","deck","player2"),
      "player2Discard"=>          Group.new("player2Discard","discard","player2"),
      "player2Sideboard"=>        Group.new("player2Sideboard","discard","player2"),
      "player2Deck2"=>            Group.new("player2Deck2","deck","player2"),
      "player2Play1"=>            Group.new("player2Play1","play","player2"),
      "player2Play2"=>            Group.new("player2Play2","play","player2"),
      "player2Play3"=>            Group.new("player2Play3","play","player2"),
      "player2Play4"=>            Group.new("player2Play4","play","player2"),
      "player2Engaged"=>          Group.new("player2Engaged","play","shared"),
      "player2Event"=>            Group.new("player2Event","play","player2"),
      "player3Hand"=>             Group.new("player3Hand","hand","player3"),
      "player3Deck"=>             Group.new("player3Deck","deck","player3"),
      "player3Discard"=>          Group.new("player3Discard","discard","player3"),
      "player3Sideboard"=>        Group.new("player3Sideboard","discard","player3"),
      "player3Deck2"=>            Group.new("player3Deck2","deck","player3"),
      "player3Play1"=>            Group.new("player3Play1","play","player3"),
      "player3Play2"=>            Group.new("player3Play2","play","player3"),
      "player3Play3"=>            Group.new("player3Play3","play","player3"),
      "player3Play4"=>            Group.new("player3Play4","play","player3"),
      "player3Engaged"=>          Group.new("player3Engaged","play","shared"),
      "player3Event"=>            Group.new("player3Event","play","player3"),
      "player4Hand"=>             Group.new("player4Hand","hand","player4"),
      "player4Deck"=>             Group.new("player4Deck","deck","player4"),
      "player4Discard"=>          Group.new("player4Discard","discard","player4"),
      "player4Sideboard"=>        Group.new("player4Sideboard","discard","player4"),
      "player4Deck2"=>            Group.new("player4Deck2","deck","player4"),
      "player4Play1"=>            Group.new("player4Play1","play","player4"),
      "player4Play2"=>            Group.new("player4Play2","play","player4"),
      "player4Play3"=>            Group.new("player4Play3","play","player4"),
      "player4Play4"=>            Group.new("player4Play4","play","player4"),
      "player4Engaged"=>          Group.new("player4Engaged","play","shared"),
      "player4Event"=>            Group.new("player4Event","play","player4"),
    }
  end

end
