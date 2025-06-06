import _ from "lodash"
import { NodeIface } from "@/schemas/node";
import { getSession } from "./session";

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMTAzMTQ4OGEtYWUxZC00MmY5LWEwYmYtMDVlNzc1MTE0NmVhLyIsImlhdCI6MTc0ODYxODg2NywibmJmIjoxNzQ4NjE4ODY3LCJleHAiOjE3NDg2MjI3NjcsImFpbyI6ImsyUmdZTERJTXk1My9uem55NlV6VE90RkJDVFlBUT09IiwiYXBwaWQiOiI4YTlkMjQ1Mi0xNTM0LTQwNzEtYWJlYS1lODliMTQ2YjNmYTYiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xMDMxNDg4YS1hZTFkLTQyZjktYTBiZi0wNWU3NzUxMTQ2ZWEvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiI4NmM4NjJhMS1jOGM2LTRkYjgtYWIwYy02ZWQ3ZGFkNzU1Y2YiLCJyaCI6IjEuQWE0QWlrZ3hFQjJ1LVVLZ3Z3WG5kUkZHNmdrQUFBQUFBQUFBd0FBQUFBQUFBQUNyQUFDdUFBLiIsInN1YiI6Ijg2Yzg2MmExLWM4YzYtNGRiOC1hYjBjLTZlZDdkYWQ3NTVjZiIsInRpZCI6IjEwMzE0ODhhLWFlMWQtNDJmOS1hMGJmLTA1ZTc3NTExNDZlYSIsInV0aSI6ImdzTmhtVy1XaWtLalVFczdJUE5rQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfZnRkIjoiRUhDdGlJWWhTMFhUSFVLeWRxS1NEakVHaS1PdVhLY2M1QTR2Q2M3YnZRb0JabkpoYm1ObFl5MWtjMjF6IiwieG1zX2lkcmVsIjoiNyAyOCIsInhtc19yZCI6IjAuNDJMallCSmlXc2NvSk1MQkxpUXd4V1Z2dVhISlI0LXBCejZXaW9ZNkhnS0tjZ29KNUhuRjVmOE9EWEpkcXJ0WnhFcF9ZVEpRbEVOSWdKTUJBZzVBYVFBIn0.HYSy5bn959fan8SZpmHt6l0KauDxt34nRiUrAS_v-_46Aq6y7cG3fR8N0pecOfhgEq21gEj3rlYEbrJ1QaCPx3bYWIl8m00_0zYDQewbza1GDnJgcuxXTnyCuOy7hKit5-tmq6-oVN9OnCaN7ksWfT9MS-ePrs5jcdinlk4HmkphW_hRy064LbDkel2tvaLXQTESkWod7hqvWeZMQW2Dmx-inQU9jOwMumfka9FnzPeYzmQ61LwF4I7JurH6MH9KkTM6-CsofSzo6w8q_mdIKP5XxhSB2ZCs8Y6-R7is3bNj-kbIoS0LSUU854m9N1ji7sCr97mmchCkL7uGFHwX4Q'

export const getToken = async (dataset: string, report: string) => {
   return fetch('https://api.powerbi.com/v1.0/myorg/GenerateToken',
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify(
            {
               'datasets': [
                  {
                     'id': dataset
                  }
               ],
               'reports': [
                  {
                     'allowEdit': true,
                     'id': report
                  }
               ]
            }
         )
      }).then(res => res.json());
}

export const getEmbedUrl = async (groupId: string, reportId: string) => {
   return fetch(`https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            'Authorization': `${token}`
         }
      }).then(res => res.json());
}