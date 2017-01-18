import * as http from 'http';
import * as finalhandler from 'finalhandler';
import { Router } from 'router';
import { Elasticsearch } from 'elasticsearch';

function test(n: number):number{
  return n + 1;
}

console.log(test(2));