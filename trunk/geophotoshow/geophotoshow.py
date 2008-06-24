import cgi
import os
import logging
import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

class MainPage(webapp.RequestHandler):
  def __init__(self):
    self.apikeys = {
      'geophotoshow.appspot.com':'ABQIAAAA5iyLqLpUbk1qBe2volmsqxTJ9Qf40usNZUXxvR8rqUf3xuKPjxR416NOzjwVnmOojLO4D7CY8QdmmQ',
      'www.geophotoshow.com':    'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSGaeOUwwPiRwprcQIp1asxXaPRShRiXXnXJ0iaG0Cp007xopXguZyRPQ',
      'geophotoshow.wctang.info':'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSLimqamy1V7um-3wk1rvbLkL2fohT90FlNYj2r04HFwWbLh13q_OT-wA',
      }

  def get(self):
    if self.request.host in self.apikeys.keys():
      apikey = self.apikeys[self.request.host]
    else:
      apikey = 'ABCD'

    template_values = {
      'apikey':apikey,
      }
    path = os.path.join(os.path.dirname(__file__),'index.html')
    self.response.out.write(template.render(path, template_values))

def main():
  application = webapp.WSGIApplication([
  										('/', MainPage),
  									   ], debug=True)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == "__main__":
  main()
