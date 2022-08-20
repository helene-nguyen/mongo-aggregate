function _404(req, res) {
    res.status(404).render('404', { title: 'ERROR 404' });
  }
  
  function _500(err, req, res) {
      res.status(500).send(err.message);
  }
  
  export { _404, _500 };
  