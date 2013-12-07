import bottle
import httplib2, json
import hello_analytics_api_v3

# below be the static server
# -------------------------------------------------------------------------------------
def application(environ, start_response):

  #  SERVE INDEX.HTML
  @bottle.route('/')
  def server_static():
    return bottle.static_file('index.html', root='../client/')

  #  SERVE STATIC ASSETS
  @bottle.route('/<filepath:path>')
  def server_static(filepath):
    return bottle.static_file(filepath, root='../client/')

  # -------------------------------------------------------------------------------------

  # INVOKE METHODS FOR GOOGLE
  @bottle.route('/write')
  def server_static():
    experiment_bodz = {
      'name': 'GREAT_TEST',
      'status': 'READY_TO_RUN',
      'objectiveMetric': 'ga:goal1Completions',
      'variations': [
        {
          'url': 'http://www.examplepetstore.com',
          'name': 'Original'
        },
        {
          'url': 'http://www.examplepetstore.com/2',
          'name': 'Gus version'
        }
      ]
    }
    hello_analytics_api_v3.insertExperiment("46140385", "UA-46140385-1", "79670733", experiment_bodz)
    return 'Attempted to write.......'



  bottle.run(host=environ['SERVER_NAME'], port=environ['SERVER_PORT'], debug=True)

#### for testing
environ = {
  'REDIRECT_URL': "adsf",
  'CLIENT_SECRET': "i'm a mushroom",
  'CLIENT_ID':"gz",
  'SERVER_NAME': 'localhost',
  'SERVER_PORT': 8080}

application(environ, "astaasdf")

