export default class Config {
  public static BG_COLOR: number = 0x222222;
  public static BARS_WIDTH: number = 15;
  public static LINES_DISTANCE: number = 20;
  public static PLAYER_MARGIN: number = 10;
  public static PLAYER_COLOR: number|string = 0xEEEEEE;
  public static SCORES_MARGIN: Object = { x: 30, y: 30 };
  public static TEXT_STYLE: Object = {
    fontSize: '60px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fill: '#eee',
    align: 'center'
  };
  public static LINES_COLOR: number = 0xEEEEEE;
  public static BALL_COLOR: number = 0xEEEEEE;
  public static BALL_SIZE: number = 10;
  public static BALL_SPEED: number = 15;
};
