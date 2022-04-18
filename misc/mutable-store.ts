class MutableStore {

  update(fn) {
    const updates = []
    const get;
    const set;
    fn(get, set)
    // apply updates
    // call subscribers
    
  }
}