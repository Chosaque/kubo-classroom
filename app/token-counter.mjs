import {Tiktoken} from 'js-tiktoken/lite';
import ranks from 'js-tiktoken/ranks/o200k_base';
export function createCounter(){const encoder=new Tiktoken(ranks);return text=>encoder.encode(text,[],[]).length;}
