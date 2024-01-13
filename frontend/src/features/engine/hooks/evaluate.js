import { isString } from "../../store/updateValues";

export const evaluate = (state, card, code) => {
    if (Array.isArray(code) && code.length > 0) {
      console.log("code")
      if (Array.isArray(code[0])) {
          var result = state;
          for (var block in code) {
              result = evaluate(result, card, block)
          }
          return result;
      } else {
        var lhs, rhs;
        switch (code[0]) {
          case "LIST":
            const result = [];
            for (var item of code.slice(1)) {
              result.push(evaluate(state, card, item))
            }
            return result;
          case "AND":
            for (var i=1; i< code.length; i++) {
              if (!evaluate(state, card, code[i])) return false;
            }
            return true;
          case "OR":
            for (var i=1; i< code.length; i++) {
              if (evaluate(state, card, code[i])) return true;
            }
            return false;
          case "EQUAL":
            return evaluate(state, card, code[1]) == evaluate(state, card, code[2])
          case "LESS_THAN":
            lhs = evaluate(state, card, code[1]) || 0;
            rhs = evaluate(state, card, code[2]) || 0;
            return lhs < rhs;
          case "GREATER_THAN":
            lhs = evaluate(state, card, code[1]) || 0;
            rhs = evaluate(state, card, code[2]) || 0;
            return lhs > rhs;
          case "LESS_EQUAL":
            lhs = evaluate(state, card, code[1]) || 0;
            rhs = evaluate(state, card, code[2]) || 0;
            return lhs <= rhs;
          case "GREATER_EQUAL":
            lhs = evaluate(state, card, code[1]) || 0;
            rhs = evaluate(state, card, code[2]) || 0;
            return lhs >= rhs;
          case "NOT_EQUAL":
            lhs = evaluate(state, card, code[1]) || 0;
            rhs = evaluate(state, card, code[2]) || 0;
            return lhs != rhs;
          case "IN_STRING":
            lhs = evaluate(state, card, code[1]) || "";
            rhs = evaluate(state, card, code[2]) || "";
            return lhs.includes(rhs);
          case "OBJ_GET_BY_PATH":
            const obj = evaluate(state, card, code[1])
            const path = evaluate(state, card, code[2])
            console.log("equal 3",code,obj,path)
            if (!path || path.length === 0) {
              return null;
            } else if (path.length === 1) {
              console.log("equal 4",obj[path[0]])
              return obj[path[0]]
            } else {
              const newObj = obj[path[0]];
              const newPath = path.slice(1);
              newPath.unshift("LIST");
              console.log("equal 4",newObj,newPath)
              return evaluate(state, card, ["OBJ_GET_BY_PATH", newObj, newPath])
            }
        }
      }
    } else { // value
      if (code === "$ACTIVE_CARD")
        return card;
      else if (code === "$ACTIVE_FACE")
        return card.sides[card.currentSide];
      else if (code === "$ACTIVE_TOKENS")
        return card.tokens;
      else if (isString(code) && code.startsWith("$") && code.includes(".")) {
        const list = code.split('.')
        const obj = evaluate(state, card, list[0])
        const newList = list.slice(1);
        newList.unshift("LIST")
        return evaluate(state, card, ["OBJ_GET_BY_PATH", obj, newList])
      } else {
        return code;
      }
    }
  }