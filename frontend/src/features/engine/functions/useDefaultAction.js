import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useDoActionList } from './useDoActionList';
import { useGameDefinition } from './useGameDefinition';

const evaluate = (state, code) => {
    if (Array.isArray(code) && code.length > 0) {
        console.log("code")
        if (Array.isArray(code[0])) {
            var result = state;
            for (var block in code) {
                result = evaluate(result, block)
            }
            return result;
        } else {
            switch (code[0]) {
                case "AND":
                  day = "Sunday";
                  break;
                case 1:
                  day = "Monday";
                  break;
                case 2:
                   day = "Tuesday";
                  break;
                case 3:
                  day = "Wednesday";
                  break;
                case 4:
                  day = "Thursday";
                  break;
                case 5:
                  day = "Friday";
                  break;
                case 6:
                  day = "Saturday";
            }
        }
    } else { // value
        console.log("val")
    }
 /*    if is_list(code) && Enum.count(code) > 0 do
    if is_list(Enum.at(code, 0)) do
      #actions = Enum.slice(code, 1, Enum.count(code))
      Enum.reduce(code, game, fn(action, acc) ->
        evaluate(acc, action)
      end)
    else
      # code = Enum.reduce(code, [], fn(code_line, acc) ->
      #   IO.puts("evaluating")
      #   IO.inspect(code_line)
      #   acc ++ [evaluate(game, code_line)]
      # end)

      case Enum.at(code,0) do
        "LOGGER" ->
          statements = Enum.slice(code, 1, Enum.count(code))
          message = Enum.reduce(statements, "", fn(statement, acc) ->
            str_statement = inspect(evaluate(game, statement))
            acc <> String.replace(str_statement,"\"","")
          end)
          IO.inspect(message)
          game
        "DEFINE" ->
          var_name = Enum.at(code, 1)
          value = evaluate(game, Enum.at(code, 2))
          put_in(game, ["variables", var_name], value)
        "LIST" ->
          list = Enum.slice(code, 1, Enum.count(code))
          Enum.reduce(list, [], fn(item,acc)->
            acc ++ [evaluate(game, item)]
          end)
        "NEXT_PLAYER" ->
          current_player_i = evaluate(game, Enum.at(code, 1))
          current_i = String.to_integer(String.slice(current_player_i, -1..-1))
          next_i = current_i + 1
          next_i = if next_i > game["numPlayers"] do 1 else next_i end
          "player" <> Integer.to_string(next_i)
        "GET_INDEX" ->
          list = evaluate(game, Enum.at(code, 1))
          value = evaluate(game, Enum.at(code, 2))
          Enum.find_index(list, fn(x) -> x == value end)
        "AT_INDEX" ->
          #raise "stop"
          list = evaluate(game, Enum.at(code, 1))
          index = evaluate(game, Enum.at(code, 2))
          if list do Enum.at(list, index) else nil end
        "LENGTH" ->
          Enum.count(evaluate(game, Enum.at(code,1)))
        "AND" ->
          statements = Enum.slice(code, 1, Enum.count(code))
          Enum.reduce_while(statements, false, fn(statement, acc) ->
            if evaluate(game, statement) == true do
              {:cont, true}
            else
              {:halt, false}
            end
          end)
        "EQUAL" ->
          evaluate(game, Enum.at(code,1)) == evaluate(game, Enum.at(code,2))
        "LESS_THAN" ->
          evaluate(game, Enum.at(code,1)) < evaluate(game, Enum.at(code,2))
        "GREATER_THAN" ->
          evaluate(game, Enum.at(code,1)) > evaluate(game, Enum.at(code,2))
        "LESS_EQUAL" ->
          evaluate(game, Enum.at(code,1)) <= evaluate(game, Enum.at(code,2))
        "GREATER_EQUAL" ->
          evaluate(game, Enum.at(code,1)) >= evaluate(game, Enum.at(code,2))
        "NOT" -> */
}

export const useDefaultAction = () => {
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();
    const defaultActions = gameDef?.defaultActions;
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    return () => {
        const state = store.getState();
        for (var defaultAction of defaultActions) {
            if (evaluate(state, defaultAction.condition)) doActionList(defaultAction.actionListId); 
        }
    }
}